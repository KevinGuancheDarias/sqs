/**
 * 
 */
package com.kevinguanchedarias.sqs.producer;

import java.util.concurrent.ExecutionException;

import com.kevinguanchedarias.sqs.AbstractClient;
import com.kevinguanchedarias.sqs.ConnectionRole;
import com.kevinguanchedarias.sqs.Message;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class TextProducer extends AbstractClient implements Producer<String> {

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.kevinguanchedarias.sqs.Client#connect(java.lang.String, int,
	 * java.lang.String)
	 */
	@Override
	public void connect(String host, int port, String queue) {
		doConnect(host, port, queue, ConnectionRole.PRODUCER);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.kevinguanchedarias.sqs.producer.Producer#sendMessage(com.
	 * kevinguanchedarias.sqs.Message)
	 */
	@Override
	public void sendMessageSync(Message<String> message) {
		String deliverString = message.getDeliverAfter() != null ? "SET DELIVER_TIMESTAMP=" + message.getDeliverAfter()
				: "SET DELIVER_DATE=" + message.getDeliverDate().toInstant();
		try {
			writeSync("\r\nSTART_METADATA\r\n");
			expectResponseSync(OK_RESPONSE);
			writeSync(deliverString + ";\r\n");
			expectResponseToContainSync(OK_WITH_VAL);
			writeSync("\r\nEND_METADATA\r\n");
			expectResponseSync(OK_RESPONSE);
			writeSync("\r\nSTART_MESSAGE\r\n");
			expectResponseSync(OK_RESPONSE);
			writeSync("\"" + message.getBody() + "\"\r\nEND_MESSAGE\r\n");
			expectResponseSync(OK_RESPONSE);
		} catch (InterruptedException | ExecutionException e) {
			commonExceptionHandler(e);
		}
	}
}
