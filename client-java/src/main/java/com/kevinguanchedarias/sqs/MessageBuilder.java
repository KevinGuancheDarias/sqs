/**
 * 
 */
package com.kevinguanchedarias.sqs;

import java.io.Serializable;
import java.lang.reflect.InvocationTargetException;
import java.util.Date;

import com.kevinguanchedarias.sqs.exception.SqsMessageInstanciationError;

/**
 * Builds a message <br>
 * <b>NOTICE:</b> While may look that as of now, doesn't make much sense, as we
 * only have {@link TextMessage}, it's highly recommended to use it, for future
 * expansions!
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class MessageBuilder {

	/**
	 * Returns a new instance of the buiilder
	 * 
	 * @param <B>
	 * @param <T>
	 * @param clazz
	 * @return
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public static <B extends Serializable, T extends Message<B>> MessageBuilder newInstance(Class<T> clazz) {
		return new MessageBuilder(clazz);
	}

	@SuppressWarnings("rawtypes")
	private Message message;

	/**
	 * Returns the built message
	 * 
	 * @param <B>
	 * @param <T>
	 * @return
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@SuppressWarnings("unchecked")
	public <B extends Serializable, T extends Message<B>> T build() {
		return (T) message;
	}

	/**
	 * Adds the body of the message
	 * 
	 * @param body
	 * @return
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@SuppressWarnings("unchecked")
	public MessageBuilder withBody(Serializable body) {
		message.setBody(body);
		return this;
	}

	/**
	 * Adds the DELIVER_DATE
	 * 
	 * @param date
	 * @return
	 * @throws IllegalArgumentException If DELIVER_AFTER is defined, can't specify
	 *                                  both dates
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public MessageBuilder withDeliverDate(Date date) {
		if (message.getDeliverAfter() != null) {
			throw new IllegalArgumentException("You can't specify deliverDate, when you have defined deliverDelay");
		}

		message.setDeliverDate(date);
		return this;
	}

	/**
	 * Adds the DELIVER_AFTER
	 * 
	 * @param secondsDelay
	 * @return
	 * @throws IllegalArgumentException If DELIVER_DATE is defined, can't specify
	 *                                  both dates
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public MessageBuilder withDeliverDelay(Long secondsDelay) {
		if (message.getDeliverDate() != null) {
			throw new IllegalArgumentException("You can't specify deliverDelay, when you have defined deliverDate");
		}
		message.setDeliverDelay(secondsDelay * 1000);
		return this;
	}

	private <B extends Serializable, T extends Message<B>> MessageBuilder(Class<T> clazz) {
		message = createMessage(clazz);
	}

	private <B extends Serializable, T extends Message<B>> T createMessage(Class<T> clazz) {
		try {
			return clazz.getDeclaredConstructor().newInstance();
		} catch (InstantiationException | IllegalAccessException | IllegalArgumentException | InvocationTargetException
				| NoSuchMethodException | SecurityException e) {
			throw new SqsMessageInstanciationError("Could NOT create an instance of " + clazz.getName(), e);
		}
	}
}
