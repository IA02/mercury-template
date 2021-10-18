/*
 * This library is part of OpenCms -
 * the Open Source Content Management System
 *
 * Copyright (c) Alkacon Software GmbH & Co. KG (http://www.alkacon.com)
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * For further information about Alkacon Software, please see the
 * company website: http://www.alkacon.com
 *
 * For further information about OpenCms, please see the
 * project website: http://www.opencms.org
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

package alkacon.mercury.webform;

import alkacon.mercury.template.writer.A_CmsWriter;

import org.opencms.file.CmsObject;
import org.opencms.file.CmsResource;
import org.opencms.i18n.CmsMessages;
import org.opencms.jsp.util.A_CmsJspCustomContextBean;
import org.opencms.main.CmsException;
import org.opencms.main.CmsLog;
import org.opencms.xml.I_CmsXmlDocument;
import org.opencms.xml.content.CmsXmlContentFactory;

import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.commons.logging.Log;

/**
 * Class representing an export bean for data submitted by a form.
 */
public abstract class A_CmsExportBean extends A_CmsJspCustomContextBean {

    /** Logger instance for this class. */
    private static final Log LOG = CmsLog.getLog(A_CmsExportBean.class);

    /** Constant for message key. */
    protected static final String KEY_HEADLINE_1 = "msg.page.form.bookingstatus.headline.1";

    /** Constant for message key. */
    protected static final String KEY_EXPORT_DATE_0 = "msg.page.form.bookingstatus.export.date";

    /** Constant for message key. */
    protected static final String KEY_SUBMISSIONS_LABEL = "msg.page.form.bookingstatus.submissions.label";

    /** Constant for message key. */
    protected static final String KEY_SUBMISSIONS_STATUS_3 = "msg.page.form.bookingstatus.submissions.status.3";

    /** Constant for message key. */
    protected static final String KEY_PLACES_LABEL = "msg.page.form.bookingstatus.places.label";

    /** Constant for message key. */
    protected static final String KEY_PLACES_LABEL_UNLIMITED = "msg.page.form.bookingstatus.places.unlimited";

    /** Constant for message key. */
    protected static final String KEY_MAXSUBMISSIONS_NOWAITLIST_1 = "msg.page.form.bookingstatus.maxsubmission.nowaitlist.1";

    /** Constant for message key. */
    protected static final String KEY_MAXSUBMISSIONS_WAITLIST_2 = "msg.page.form.bookingstatus.maxsubmission.waitlist.2";

    /** Constant for message key. */
    protected static final String KEY_FREEPLACES_LABEL = "msg.page.form.bookingstatus.freeplaces.label";

    /** Constant for message key. */
    protected static final String KEY_FULLYBOOKED = "msg.page.form.bookingstatus.fullybooked";

    /** Constant for message key. */
    protected static final String KEY_ONLYWAITLIST_1 = "msg.page.form.bookingstatus.onlywaitlist.1";

    /** Constant for message key. */
    protected static final String KEY_REMAININGSUBMISSIONS_NOWAITLIST_1 = "msg.page.form.bookingstatus.remainingsubmissions.nowaitlist.1";

    /** Constant for message key. */
    protected static final String KEY_REMAININGSUBMISSIONS_WAITLIST_2 = "msg.page.form.bookingstatus.remainingsubmissions.waitlist.2";

    /** Constant for message key. */
    protected static final String KEY_SUBMISSIONDATA_HEADLINE = "msg.page.form.bookingstatus.submissiondata.heading";

    /** Constant for message key. */
    protected static final String KEY_STATUS_CANCELLED = "msg.page.form.status.submission.cancelled";

    /** Constant for message key. */
    protected static final String KEY_STATUS_WAITLIST = "msg.page.form.status.submission.waitlist";

    /** Constant for message key. */
    protected static final String KEY_STATUS_CONFIRMED = "msg.page.form.status.submission.confirmed";

    /** Constant for message key. */
    //protected static final String KEY_STATUS_MAILED = "msg.page.form.status.submission.mailed";

    /** Constant for message key. */
    protected static final String KEY_STATUS_CHANGED = "msg.page.form.status.submission.changed";

    /** The bundle with the localization keys. */
    protected static final String BUNDLE_NAME = "alkacon.mercury.template.messages";

    /** The form to export submissions for. */
    protected CmsFormBean m_form;

    /** The form's title. */
    protected String m_formTitle;

    /** The message bundle to get the localizations from - already open for the correct locale. */
    protected CmsMessages m_messages;

    /**
     * Exports the submission data and returns the writer holding the data.
     * @return the writer
     */
    abstract public A_CmsWriter export();

    /**
     * Initialize the export bean.
     * @param form the form to export data for.
     * @param formTitle the form title to print in the export.
     * @param locale the locale to export the data in.
     */
    public void init(CmsFormBean form, String formTitle, Locale locale) {

        m_form = form;
        m_formTitle = formTitle;
        m_messages = new CmsMessages(BUNDLE_NAME, locale);
    }

    /**
     * Generates the String value to put in the CSV instead of the boolean value provided.
     * @param b the value to convert to a String.
     * @return the value as it is printed in the CSV output.
     */
    protected String asString(boolean b) {

        return b ? "X" : "";
    }

    /**
     * Collects all actual and former data keys from a collection of stored form submissions and
     * transforms the collected data keys into a ordered map with the column names as the keys
     * of the map and the position as the value.
     * @param formDataBeans the form data beans
     * @return the column name / position map.
     */
    protected Map<String, Integer> collectColumnNames(List<CmsFormDataBean> formDataBeans) {

        Map<String, Integer> columnNames = new LinkedHashMap<String, Integer>();
        for (CmsFormDataBean formDataBean : formDataBeans) {
            for (String field : formDataBean.getData().keySet()) {
                if (!columnNames.containsKey(field)) {
                    columnNames.put(field, Integer.valueOf(columnNames.size()));
                }
            }
        }
        columnNames.put(m_messages.key(KEY_STATUS_CANCELLED), Integer.valueOf(columnNames.size()));
        columnNames.put(m_messages.key(KEY_STATUS_WAITLIST), Integer.valueOf(columnNames.size()));
        columnNames.put(m_messages.key(KEY_STATUS_CONFIRMED), Integer.valueOf(columnNames.size()));
        columnNames.put(m_messages.key(KEY_STATUS_CHANGED), Integer.valueOf(columnNames.size()));
        return columnNames;
    }

    /**
     * Produces the CSV export or Excel export for data submitted by a form.
     * @param writer the writer
     * @return the CSV or Excel export data.
     */
    protected A_CmsWriter export(A_CmsWriter writer) {

        CmsSubmissionStatus status = m_form.getSubmissionStatus();
        // Add meta data
        writer.addRow(m_messages.key(KEY_HEADLINE_1, m_formTitle));
        writer.addRow();
        writer.addRow(m_messages.key(KEY_EXPORT_DATE_0), m_messages.getDateTime(new Date(), DateFormat.LONG));
        writer.addRow();
        writer.addRow(
            m_messages.key(KEY_SUBMISSIONS_LABEL),
            m_messages.key(
                KEY_SUBMISSIONS_STATUS_3,
                Integer.valueOf(status.getNumTotalSubmissions()),
                Integer.valueOf(status.getNumFormSubmissions()),
                Integer.valueOf(status.getNumOtherSubmissions())));
        writer.addRow(
            m_messages.key(KEY_PLACES_LABEL),
            null == status.getMaxRegularSubmissions()
            ? m_messages.key(m_messages.key(KEY_PLACES_LABEL_UNLIMITED))
            : status.getMaxWaitlistSubmissions() == 0
            ? m_messages.key(KEY_MAXSUBMISSIONS_NOWAITLIST_1, status.getMaxRegularSubmissions())
            : m_messages.key(
                KEY_MAXSUBMISSIONS_WAITLIST_2,
                status.getMaxRegularSubmissions(),
                Integer.valueOf(status.getMaxWaitlistSubmissions())));
        writer.addRow(
            m_messages.key(KEY_FREEPLACES_LABEL),
            status.isFullyBooked()
            ? m_messages.key(KEY_FULLYBOOKED)
            : status.isOnlyWaitlist()
            ? m_messages.key(KEY_ONLYWAITLIST_1, Integer.valueOf(status.getNumRemainingWaitlistSubmissions()))
            : status.getMaxWaitlistSubmissions() == 0
            ? m_messages.key(KEY_REMAININGSUBMISSIONS_NOWAITLIST_1, status.getNumRemainingRegularSubmissions())
            : m_messages.key(
                KEY_REMAININGSUBMISSIONS_WAITLIST_2,
                status.getNumRemainingRegularSubmissions(),
                Integer.valueOf(status.getNumRemainingWaitlistSubmissions())));
        writer.addRow();
        writer.addRow(m_messages.key(KEY_SUBMISSIONDATA_HEADLINE));
        writer.addRow();
        List<CmsFormDataBean> formDataBeans = readFormDataBeans();
        Collections.reverse(formDataBeans);
        writer.addTable(collectColumnNames(formDataBeans));
        for (CmsFormDataBean formDataBean : formDataBeans) {
            writer.addTableRow(getData(formDataBean));
        }
        return writer;
    }

    /**
     * Returns the data of one submission as a map. May include inactive former columns.
     * @param formData the submission data as bean.
     * @return the submission data as map.
     */
    protected Map<String, String> getData(CmsFormDataBean formData) {

        Map<String, String> data = formData.getData();
        data.put(m_messages.key(KEY_STATUS_CANCELLED), asString(formData.isCancelled()));
        data.put(m_messages.key(KEY_STATUS_WAITLIST), asString(formData.isWaitlist()));
        data.put(m_messages.key(KEY_STATUS_CONFIRMED), asString(formData.isConfirmationMailSent()));
        data.put(m_messages.key(KEY_STATUS_CHANGED), asString(formData.isChanged()));
        return data;
    }

    /**
     * Reads all form submissions from the database and returns the data as a list of form data beans.
     * @return the list of form data beans
     */
    protected List<CmsFormDataBean> readFormDataBeans() {

        CmsObject cms = getCmsObject();
        List<CmsFormDataBean> formDataBeans = new ArrayList<CmsFormDataBean>();
        for (CmsResource submission : m_form.getSubmissions()) {
            try {
                I_CmsXmlDocument formDataXml;
                formDataXml = CmsXmlContentFactory.unmarshal(cms, cms.readFile(submission));
                CmsFormDataBean formDataBean = new CmsFormDataBean(formDataXml);
                formDataBeans.add(formDataBean);
            } catch (CmsException e) {
                LOG.warn(
                    "Failed to read submission data from " + submission.getRootPath() + " when exporting the data.",
                    e);
            }
        }
        return formDataBeans;
    }
}
