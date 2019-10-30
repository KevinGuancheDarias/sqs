/**
 * 
 */
package com.kevinguanchedarias.sqs.producer;

import com.kevinguanchedarias.sqs.Message;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class TextProducer extends AbstractProducer<String> implements Producer<String> {

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.kevinguanchedarias.sqs.producer.AbstractProducer#createMessageBody(com.
	 * kevinguanchedarias.sqs.Message)
	 */
	@Override
	protected String createMessageBody(Message<String> message) {
		return "\"" + message.getBody() + "\"";
	}

}
