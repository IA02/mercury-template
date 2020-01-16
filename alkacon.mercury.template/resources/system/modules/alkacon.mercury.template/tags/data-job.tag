<%@ tag pageEncoding="UTF-8"
    display-name="data-job"
    body-content="empty"
    trimDirectiveWhitespaces="true"
    description="Generates schema.org data for jobs." %>


<%@ attribute name="content" type="org.opencms.jsp.util.CmsJspContentAccessBean" required="true"
    description="The XML content to use for data generation."%>


<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="mercury" tagdir="/WEB-INF/tags/mercury" %>


<%-- Using the same logic as the elaborate display teaser --%>
<c:set var="value"          value="${content.value}" />

<c:set var="paragraphIntro" value="${value.Introduction}" />
<c:set var="paragraphText"  value="${content.valueList.Text['0']}" />

<c:set var="intro"          value="${value['TeaserData/TeaserIntro'].isSet ? value['TeaserData/TeaserIntro'] : value.Intro}" />
<c:set var="title"          value="${value['TeaserData/TeaserTitle'].isSet ? value['TeaserData/TeaserTitle'] : value.Title}" />
<c:set var="description"    value="${paragraphIntro.value.Text.isSet ? paragraphIntro.value.Text : paragraphText.value.Text}" />
<c:set var="image"          value="${paragraphIntro.value.Image.isSet ? paragraphIntro.value.Image : paragraphText.value.Image}" />

<c:set var="url">${cms.site.url}<cms:link>${content.filename}</cms:link></c:set>

<%--
# JSON-LD Generation for Mercury job posting.
# See: https://schema.org/JobPosting
# See: https://developers.google.com/search/docs/data-types/job-posting
--%>
<cms:jsonobject var="jsonLd">
    <cms:jsonvalue key="@context" value="http://schema.org" />
    <cms:jsonvalue key="@type" value="JobPosting" />
    <cms:jsonvalue key="url" value="${url}" />
    <cms:jsonvalue key="mainEntityOfPage" value="${url}" />

    <cms:jsonvalue key="title">
        <c:out value="${title}" />
    </cms:jsonvalue>

    <c:if test="${value.Date.isSet}">
        <cms:jsonvalue key="datePosted"><fmt:formatDate value="${cms:convertDate(value.Date)}" pattern="yyyy-MM-dd" /></cms:jsonvalue>
    </c:if>
    <c:if test="${value.EndDate.isSet}">
        <cms:jsonvalue key="validThrough"><fmt:formatDate value="${cms:convertDate(value.EndDate)}" pattern="yyyy-MM-dd'T'HH:mm" /></cms:jsonvalue>
    </c:if>

    <c:if test="${description.isSet}">
        <cms:jsonvalue key="description" value="${description}" />
    </c:if>

    <c:if test="${image.isSet}">
        <mercury:image-vars image="${image}" createJsonLd="${true}">
            <cms:jsonvalue key="image" value="${imageJsonLd}" />
        </mercury:image-vars>
    </c:if>

    <c:if test="${value.EmploymentType.isSet}">
        <cms:jsonarray key="employmentType">
            <c:forEach var="employmentType" items="${content.valueList.EmploymentType}">
                 <cms:jsonvalue value="${employmentType.toString}" />
            </c:forEach>
        </cms:jsonarray>
    </c:if>

    <mercury:data-organization-vars content="${content}">
        <cms:jsonvalue key="hiringOrganization" value="${orgJsonLd}" />
    </mercury:data-organization-vars>

    <mercury:location-vars data="${value.AddressChoice}" createJsonLd="${true}">
        <cms:jsonvalue key="jobLocation" value="${locJsonLd}" />
    </mercury:location-vars>

</cms:jsonobject>

<mercury:nl />
<script type="application/ld+json">${jsonLd.compact}</script><%----%>
<mercury:nl />
