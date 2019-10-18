/**
 * 
 */
package com.kevinguanchedarias.sqs;

import java.util.Date;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class TextMessage implements Message<String> {
	private String body;
	private Date deliverDate;
	private Long deliverAfter;

	/**
	 * 
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	TextMessage() {

	}

	/**
	 * @return the body
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@Override
	public String getBody() {
		return body;
	}

	/**
	 * @param body the body to set
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	@Override
	public void setBody(String body) {
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
