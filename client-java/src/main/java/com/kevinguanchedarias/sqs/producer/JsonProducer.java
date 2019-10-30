/**
 * 
 */
package com.kevinguanchedarias.sqs.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kevinguanchedarias.sqs.JsonMessageInner;
import com.kevinguanchedarias.sqs.Message;
import com.kevinguanchedarias.sqs.exception.SqsBadJsonException;

/**
 * Produces JSON messages
 * 
 * @since 1.1.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class JsonProducer extends AbstractProducer<JsonMessageInner> {

	private ObjectMapper mapper;

	/**
	 * 
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public JsonProducer(ObjectMapper mapper) {
		this.mapper = mapper;
	}

	/**
	 * 
	 * @todo In the future on exception run something like RUN ABORT_MESSAGE, that
	 *       should exit the MESSAGE section
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@Override
	protected String createMessageBody(Message<JsonMessageInner> message) {
		try {
			return mapper.writeValueAsString(message.getBody());
		} catch (JsonProcessingException e) {
			throw new SqsBadJsonException(
					"Couldn't create the JSON, in the future, run something like RUN ABORT_MESSAGE", e);
		}
	}

}
