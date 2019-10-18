/**
 * 
 */
package com.kevinguanchedarias.sqs.consumer;

import java.io.Serializable;
import java.util.concurrent.ExecutionException;

import com.kevinguanchedarias.sqs.AbstractClient;
import com.kevinguanchedarias.sqs.ConnectionRole;
import com.kevinguanchedarias.sqs.Message;
import com.kevinguanchedarias.sqs.MessageBuilder;
import com.kevinguanchedarias.sqs.TextMessage;
import com.kevinguanchedarias.sqs.enumerations.ConnectionState;
import com.kevinguanchedarias.sqs.exception.SqsBadStateException;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public abstract class AbstractConsumer<T extends Serializable> extends AbstractClient implements Consumer<T> {
	protected Thread thread;

	protected abstract T transformResult(String body);

	@Override
	public void connect(String host, int port, String queue) {
		doConnect(host, port, queue, ConnectionRole.CONSUMER);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.kevinguanchedarias.sqs.consumer.Consumer#receiveMessageSync()
	 */
	@Override
	public Message<T> receiveMessageSync() {
		try {
			writeSync("\r\nSTART_GET_MESSAGE\r\n");
			String result = getConnectionMessageSync(connection);
			writeSync("\r\nEND_GET_MESSAGE\r\n");
			expectResponseToContainSync(OK_RESPONSE);
			return MessageBuilder.newInstance(TextMessage.class).withBody(result).build();
		} catch (InterruptedException | ExecutionException e) {
			commonExceptionHandler(e);
		}
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.kevinguanchedarias.sqs.consumer.Consumer#onMessage(com.kevinguanchedarias
	 * .sqs.consumer.MessageConsumer)
	 */
	@Override
	public void onMessage(OnMessageLambda<T> messageLambda) {
		if (thread == null) {
			checkReadyToSubscribeToMessages();
			thread = new Thread(() -> onMessageThreadBody(messageLambda));
			thread.start();
		}
	}

	/**
	 * The code that runs inside the thread listening messages
	 * 
	 * @param messageLambda
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	protected void onMessageThreadBody(OnMessageLambda<T> messageLambda) {
		while (true) {
			if (!connection.isOpen()) {
				System.out.println("Abandoning execution, of onMessage thread");
				thread = null;
				break;
			}
			checkReadyToSubscribeToMessages();
			Message<T> message = receiveMessageSync();
			if (message != null) {
				messageLambda.handler(message);
			}
		}
	}

	/**
	 * Checks if we can invoke onMessage listener
	 * 
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	protected void checkReadyToSubscribeToMessages() {
		if (!connection.isOpen()) {
			throw new SqsBadStateException("Can't invoke onMessage when connection is closed");
		}
		if (connectionState != ConnectionState.CONNECTED_AFTER_CONFIG) {
			throw new SqsBadStateException(
					"Can't invoke onMessage when the connection state is " + connectionState.name());
		}
	}
}
