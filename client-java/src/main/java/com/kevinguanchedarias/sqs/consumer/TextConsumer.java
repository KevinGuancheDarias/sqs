/**
 * 
 */
package com.kevinguanchedarias.sqs.consumer;

import com.kevinguanchedarias.sqs.Message;
import com.kevinguanchedarias.sqs.TextMessage;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class TextConsumer extends AbstractConsumer<String> implements Consumer<String> {

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.kevinguanchedarias.sqs.consumer.AbstractConsumer#transformResult(java.
	 * lang.String)
	 */
	@Override
	protected String transformResult(String body) {
		return body.substring(1).substring(0, body.length() - 1);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.kevinguanchedarias.sqs.consumer.AbstractConsumer#getMessageClass()
	 */
	@Override
	protected Class<? extends Message<String>> getMessageClass() {
		return TextMessage.class;
	}

}
