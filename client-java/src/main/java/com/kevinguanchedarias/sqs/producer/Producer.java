/**
 * 
 */
package com.kevinguanchedarias.sqs.producer;

import java.io.Serializable;

import com.kevinguanchedarias.sqs.Client;
import com.kevinguanchedarias.sqs.Message;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public interface Producer<T extends Serializable> extends Client {

	/**
	 * Sends a message to the queue system
	 * 
	 * @param message
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public void sendMessageSync(Message<T> message);
}
