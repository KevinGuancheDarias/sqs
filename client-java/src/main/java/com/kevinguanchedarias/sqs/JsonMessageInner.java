/**
 * 
 */
package com.kevinguanchedarias.sqs;

import java.io.Serializable;
import java.util.Map;

/**
 * 
 * @since 1.1.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class JsonMessageInner implements Serializable {
	private static final long serialVersionUID = -177852112620940662L;
	private String type;
	private transient Map<String, Object> content;

	public JsonMessageInner() {

	}

	/**
	 * @param type
	 * @param content
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public JsonMessageInner(String type, Map<String, Object> content) {
		this.type = type;
		this.content = content;
	}

	/**
	 * @return the type
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public String getType() {
		return type;
	}

	/**
	 * @param type the type to set
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * @return the content
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public Map<String, Object> getContent() {
		return content;
	}

	/**
	 * @param content the content to set
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public void setContent(Map<String, Object> content) {
		this.content = content;
	}

}
