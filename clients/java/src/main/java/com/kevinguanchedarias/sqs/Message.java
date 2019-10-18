/**
 * 
 */
package com.kevinguanchedarias.sqs;

import java.io.Serializable;
import java.util.Date;

/**
 * Represents a message to be produced, or received
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public interface Message<T extends Serializable> {

	/**
	 * 
	 * @return
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public T getBody();

	/**
	 * 
	 * @return
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public Date getDeliverDate();

	/**
	 * 
	 * @return
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public Long getDeliverAfter();

	/**
	 * 
	 * @param body
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public void setBody(T body);

	/**
	 * 
	 * @param date
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public void setDeliverDate(Date date);

	/**
	 * 
	 * @param time
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public void setDeliverDelay(Long time);
}
