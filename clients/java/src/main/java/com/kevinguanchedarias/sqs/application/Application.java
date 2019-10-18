/**
 * 
 */
package com.kevinguanchedarias.sqs.application;

import com.kevinguanchedarias.sqs.Message;
import com.kevinguanchedarias.sqs.MessageBuilder;
import com.kevinguanchedarias.sqs.TextMessage;
import com.kevinguanchedarias.sqs.consumer.Consumer;
import com.kevinguanchedarias.sqs.consumer.TextConsumer;
import com.kevinguanchedarias.sqs.exception.ApplicationException;
import com.kevinguanchedarias.sqs.producer.Producer;
import com.kevinguanchedarias.sqs.producer.TextProducer;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class Application {
	private static final String HOST_ENV = "SQS_HOST";
	private static final String PORT_ENV = "SQS_PORT";
	private static final String QUEUE_ENV = "SQS_QUEUE";

	public static void main(String[] args) throws InterruptedException {
		String host = findEnvVarOrDie(HOST_ENV);
		Integer port = Integer.valueOf(findEnvVarOrDie(PORT_ENV));
		String queue = findEnvVarOrDie(QUEUE_ENV);
		Producer<String> producer = new TextProducer();
		producer.connect(host, port, queue);
		Message<String> testMessage = MessageBuilder.newInstance(TextMessage.class).withBody("THIS IS A TEST")
				.withDeliverDelay(10L).build();
		producer.sendMessageSync(testMessage);
		producer.quit();

		Consumer<String> consumer = new TextConsumer();
		consumer.connect(host, port, queue);
		Message<String> message = consumer.receiveMessageSync();
		System.out.println("The message is : " + message.getBody());
		System.out.println("Subscribing to events");
		consumer.onMessage(receivedMessage -> System.out.println("Received message: " + receivedMessage.getBody()));
		while (true) {
			if (!consumer.isAlive()) {
				System.out.println("Connection is dead!");
				break;
			} else {
				Thread.sleep(1000);
			}
		}
		consumer.quit();
	}

	private static String findEnvVarOrDie(String envVar) {
		String value = System.getenv(envVar);
		if (value == null) {
			throw new ApplicationException("Env Variable: " + envVar + " was not passed");
		}
		return value;
	}
}
