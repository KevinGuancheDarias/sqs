/**
 * 
 */
package com.kevinguanchedarias.sqs;

import java.io.Serializable;
import java.util.Date;

/**
 * 
 * @since 1.1.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public abstract class AbstractMessage<T extends Serializable> implements Message<T> {
	private T body;
	private Date deliverDate;
	private Long deliverAfter;

	/**
	 * 
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	AbstractMessage() {
		// Disallow instanciation from outside package
	}

	/**
	 * @return the body
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@Override
	public T getBody() {
		return body;
	}

	/**
	 * @param body the body to set
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@Override
	public void setBody(T body) {
		this.body = body;
	}

	/**
	 * @return the deliverDate
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@Override
	public Date getDeliverDate() {
		return deliverDate;
	}

	/**
	 * @param deliverDate the deliverDate to set
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@Override
	public void setDeliverDate(Date deliverDate) {
		this.deliverDate = deliverDate;
	}

	/**
	 * @return the deliverAfter
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@Override
	public Long getDeliverAfter() {
		return deliverAfter;
	}

	/**
	 * @param deliverAfter the deliverAfter to set
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@Override
	public void setDeliverDelay(Long deliverAfter) {
		this.deliverAfter = deliverAfter;
	}
}
