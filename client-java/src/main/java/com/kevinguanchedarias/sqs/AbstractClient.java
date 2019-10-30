/**
 * 
 */
package com.kevinguanchedarias.sqs;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousSocketChannel;
import java.util.concurrent.ExecutionException;

import com.kevinguanchedarias.sqs.enumerations.ConnectionState;
import com.kevinguanchedarias.sqs.exception.SqsConnectionException;
import com.kevinguanchedarias.sqs.exception.SqsInvalidServerResponseException;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public abstract class AbstractClient implements Client {
	protected static final int BUFFER_MAX_SIZE = 1 * 1024 * 1024 * 16;
	protected static final String OK_RESPONSE = "OK";
	protected static final String OK_WITH_VAL = "OK:";

	protected AsynchronousSocketChannel connection;
	protected ConnectionState connectionState = ConnectionState.NOT_WANTING_CONNECTION;

	@Override
	public boolean isAlive() {
		return connection.isOpen() && connectionState != ConnectionState.NOT_WANTING_CONNECTION
				&& connectionState != ConnectionState.NOT_CONNECTED;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.kevinguanchedarias.sqs.Client#quit()
	 */
	@Override
	public void quit() {
		ByteBuffer buffer = ByteBuffer.wrap("\r\nRUN QUIT\r\n".getBytes());
		try {
			connectionState = ConnectionState.NOT_WANTING_CONNECTION;
			connection.write(buffer).get();
			expectResponseSync(OK_RESPONSE);
			connection.close();
		} catch (InterruptedException | ExecutionException | IOException e) {
			Thread.currentThread().interrupt();
			throw new SqsConnectionException("Couldn't gracefully quit", e);
		}
	}

	/**
	 * Connects to the SQS server
	 * 
	 * @param host
	 * @param port
	 * @param queue
	 * @param role  Role can be only PRODUCER or CONSUMER
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	protected void doConnect(String host, int port, String queue, ConnectionRole role) {
		try {
			connection = AsynchronousSocketChannel.open();
			connection.connect(new InetSocketAddress(host, port)).get();
			expectResponseSync("HELO SERVER");
			connectionState = ConnectionState.CONNECTED_BEFORE_CONFIG;
			sendConfigSection(queue, role);
			expectResponseSync(OK_RESPONSE);
			connectionState = ConnectionState.CONNECTED_AFTER_CONFIG;
		} catch (IOException | ExecutionException | InterruptedException e) {
			commonExceptionHandler(e);
		}
	}

	/**
	 * Sends the configuration to the SQS server
	 * 
	 * @param queue
	 * @param role
	 * @throws InterruptedException
	 * @throws ExecutionException
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	protected void sendConfigSection(String queue, ConnectionRole role)
			throws InterruptedException, ExecutionException {
		writeSync("\r\nSTART_CONFIG\r\n");
		expectResponseSync(OK_RESPONSE);
		writeSync("\r\nSET QUEUE=" + queue + ";\r\n");
		expectResponseToContainSync(OK_WITH_VAL);
		writeSync("\r\nSET ROLE=" + role.name() + ";\r\n");
		expectResponseToContainSync(OK_WITH_VAL);
		writeSync("\r\nEND_CONFIG\r\n");
	}

	/**
	 * Reads a message (a response, not an actual "message) from the server
	 * 
	 * @param client
	 * @return
	 * @throws InterruptedException
	 * @throws ExecutionException
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	protected String getConnectionMessageSync(AsynchronousSocketChannel client)
			throws InterruptedException, ExecutionException {
		ByteBuffer readBuffer = ByteBuffer.allocate(BUFFER_MAX_SIZE);
		client.read(readBuffer).get();
		String retVal = new String(readBuffer.array()).trim();
		readBuffer.clear();
		return retVal;
	}

	/**
	 * Throws if the response doesn't contain the expected string
	 * 
	 * @param expected
	 * @return
	 * @throws InterruptedException
	 * @throws ExecutionException
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	protected String expectResponseToContainSync(String expected) throws InterruptedException, ExecutionException {
		String response = getConnectionMessageSync(connection);
		if (!response.contains(expected)) {
			throw SqsInvalidServerResponseException.fromExpectation(expected, response);
		}
		return response;
	}

	/**
	 * Throws if the response doesn't match the expected string
	 * 
	 * @param expected
	 * @return
	 * @throws InterruptedException
	 * @throws ExecutionException
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	protected String expectResponseSync(String expected) throws InterruptedException, ExecutionException {
		String response = getConnectionMessageSync(connection);
		if (!response.equals(expected)) {
			throw SqsInvalidServerResponseException.fromExpectation(expected, response);
		}
		return response;
	}

	/**
	 * Writes a string to the socket
	 * 
	 * @param input
	 * @throws InterruptedException
	 * @throws ExecutionException
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	protected void writeSync(String input) throws InterruptedException, ExecutionException {
		ByteBuffer writeBuffer = ByteBuffer.wrap(input.getBytes());
		connection.write(writeBuffer).get();
	}

	/**
	 * Handles exceptions commonly thrown by the operations with the socket
	 * 
	 * @param e
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	protected void commonExceptionHandler(Exception e) {
		connectionState = ConnectionState.NOT_CONNECTED;
		if (InterruptedException.class.isInstance(e)) {
			Thread.currentThread().interrupt();
		}
		throw new SqsConnectionException("Couldn't connect to SQS server", e);
	}
}
