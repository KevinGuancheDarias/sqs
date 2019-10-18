/**
 * 
 */
package com.kevinguanchedarias.sqs.consumer;

import java.io.Serializable;

import com.kevinguanchedarias.sqs.Message;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
@FunctionalInterface
public interface OnMessageLambda<B extends Serializable> {
	public void handler(Message<B> message);
}
