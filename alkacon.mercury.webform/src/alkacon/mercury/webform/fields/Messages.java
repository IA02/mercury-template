/*
 * This program is part of the Alkacon OpenCms Mercury Template.
 *
 * Copyright (c) Alkacon Software GmbH & Co. KG (http://www.alkacon.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package alkacon.mercury.webform.fields;

import alkacon.mercury.webform.fields.Messages;
import org.opencms.i18n.A_CmsMessageBundle;
import org.opencms.i18n.I_CmsMessageBundle;

/**
 * Convenience class to access the localized messages of this OpenCms package.<p>
 */
public final class Messages extends A_CmsMessageBundle {

    /** Message constant for key in the resource bundle. */
    public static final String LOG_ERR_CAPTCHA_CONFIG_IMAGE_SIZE_2 = "LOG_ERR_CAPTCHA_CONFIG_IMAGE_SIZE_2";

    /** Message constant for key in the resource bundle. */
    public static final String LOG_ERR_FIELD_INSTANTIATION_1 = "LOG_ERR_FIELD_INSTANTIATION_1";

    /** Message constant for key in the resource bundle. */
    public static final String LOG_ERR_PATTERN_SYNTAX_0 = "LOG_ERR_PATTERN_SYNTAX_0";

    /** Message constant for key in the resource bundle. */
    public static final String LOG_ERR_READING_CUSTOM_FORM_FIELD_PROPERTIES_1 = "LOG_ERR_READING_CUSTOM_FORM_FIELD_PROPERTIES_1";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_INIT_TABLE_FIELD_UNEQUAL_0 = "ERR_INIT_TABLE_FIELD_UNEQUAL_0";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_INIT_TABLE_FIELD_UNIQUE_1 = "ERR_INIT_TABLE_FIELD_UNIQUE_1";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_CONFIGURATION_2 = "ERR_SELECTWIDGET_CONFIGURATION_2";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_CONFIGURATION_FIND_2 = "ERR_SELECTWIDGET_CONFIGURATION_FIND_2";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_CONFIGURATION_KEY_DUPLICATE_2 = "ERR_SELECTWIDGET_CONFIGURATION_KEY_DUPLICATE_2";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_CONFIGURATION_KEY_MISSING_3 = "ERR_SELECTWIDGET_CONFIGURATION_KEY_MISSING_3";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_CONFIGURATION_KEY_UNKNOWN_2 = "ERR_SELECTWIDGET_CONFIGURATION_KEY_UNKNOWN_2";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_CONFIGURATION_KEYVALUE_LENGTH_1 = "ERR_SELECTWIDGET_CONFIGURATION_KEYVALUE_LENGTH_1";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_CONFIGURATION_READ_1 = "ERR_SELECTWIDGET_CONFIGURATION_READ_1";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_CONFIGURATION_RESOURCE_INVALID_2 = "ERR_SELECTWIDGET_CONFIGURATION_RESOURCE_INVALID_2";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_CONFIGURATION_RESOURCE_NOFOLDER_2 = "ERR_SELECTWIDGET_CONFIGURATION_RESOURCE_NOFOLDER_2";

    /** Message constant for key in the resource bundle. */
    public static final String ERR_SELECTWIDGET_INTERNAL_CONFIGURATION_2 = "ERR_SELECTWIDGET_INTERNAL_CONFIGURATION_2";

    /** Message constant for key in the resource bundle. */
    public static final String LOG_ERR_SELECTWIDGET_NO_RESOURCES_FOUND_3 = "LOG_ERR_SELECTWIDGET_NO_RESOURCES_FOUND_3";

    /** Message constant for key in the resource bundle. */
    public static final String LOG_ERR_SELECTWIDGET_XPATH_INVALID_4 = "LOG_ERR_SELECTWIDGET_XPATH_INVALID_4";

    /** Name of the used resource bundle. */
    private static final String BUNDLE_NAME = "alkacon.mercury.webform.fields.messages";

    /** Static instance member. */
    private static final I_CmsMessageBundle INSTANCE = new Messages();

    /**
     * Hides the public constructor for this utility class.<p>
     */
    private Messages() {

        // hide the constructor
    }

    /**
     * Returns an instance of this localized message accessor.<p>
     *
     * @return an instance of this localized message accessor
     */
    public static I_CmsMessageBundle get() {

        return INSTANCE;
    }

    /**
     * Returns the bundle name for this OpenCms package.<p>
     *
     * @return the bundle name for this OpenCms package
     */
    @Override
    public String getBundleName() {

        return BUNDLE_NAME;
    }
}