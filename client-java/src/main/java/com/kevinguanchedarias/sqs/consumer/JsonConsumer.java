/**
 * 
 */
package com.kevinguanchedarias.sqs.consumer;

import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kevinguanchedarias.sqs.JsonMessageInner;
import com.kevinguanchedarias.sqs.JsonMessageOuter;
import com.kevinguanchedarias.sqs.Message;
import com.kevinguanchedarias.sqs.exception.SqsBadJsonException;

/**
 * 
 * @since 1.1.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class JsonConsumer extends AbstractConsumer<JsonMessageInner> {

	private ObjectMapper mapper;

	/**
	 * @param mapper
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public JsonConsumer(ObjectMapper mapper) {
		this.mapper = mapper;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.kevinguanchedarias.sqs.consumer.AbstractConsumer#transformResult(java.
	 * lang.String)
	 */
	@Override
	protected JsonMessageInner transformResult(String body) {
		try {
			return mapper.readValue(body, JsonMessageInner.class);
		} catch (IOException e) {
			throw new SqsBadJsonException(
					"Couldn't parse the JSON, in the future, run something like RUN ABORT_GET_MESSAGE", e);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.kevinguanchedarias.sqs.consumer.AbstractConsumer#getMessageClass()
	 */
	@Override
	protected Class<? extends Message<JsonMessageInner>> getMessageClass() {
		return JsonMessageOuter.class;
	}

}
