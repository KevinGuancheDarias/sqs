/**
 * 
 */
package com.kevinguanchedarias.sqs.consumer;

import java.io.Serializable;

import com.kevinguanchedarias.sqs.Client;
import com.kevinguanchedarias.sqs.Message;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public interface Consumer<B extends Serializable> extends Client {

	/**
	 * Receives a message (blocking wait, will wait for a message
	 * 
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 * @return
	 */
	public Message<B> receiveMessageSync();

	/**
	 * Fires when a message arrives
	 * 
	 * @param messageConsumer
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public void onMessage(OnMessageLambda<B> messageConsumer);
}
