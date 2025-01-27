<%@page
    pageEncoding="UTF-8"
    buffer="none"
    session="false"
    trimDirectiveWhitespaces="true" %>


<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="cms" uri="http://www.opencms.org/taglib/cms"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="mercury" tagdir="/WEB-INF/tags/mercury" %>


<cms:secureparams />
<mercury:init-messages>

<cms:formatter var="content" val="value">

<fmt:setLocale value="${cms.locale}" />
<cms:bundle basename="alkacon.mercury.template.messages">

<mercury:setting-defaults>

<c:set var="keyPieceLayout"         value="${setting.keyPieceLayout.toInteger}" />
<c:set var="pieceLayout"            value="${setting.pieceLayout.toInteger}" />
<c:set var="pieceLayoutAlternating" value="${setting.pieceLayoutAlternating.toBoolean}" />
<c:set var="pieceLayoutSizeDesktop" value="${setting.pieceLayoutSizeDesktop.useDefault('99').toInteger}" />
<c:set var="hsize"                  value="${setting.hsize.toInteger}" />
<c:set var="imageRatio"             value="${setting.imageRatio}" />
<c:set var="imageRatioParagraphs"   value="${setting.imageRatioParagraphs}" />
<c:set var="containerType"          value="${setting.containerType.useDefault('element').toString}" />
<c:set var="showImageCopyright"     value="${setting.showImageCopyright.toBoolean}" />
<c:set var="showImageSubtitle"      value="${setting.showImageSubtitle.toBoolean}" />
<c:set var="showImageZoom"          value="${setting.showImageZoom.toBoolean}" />
<c:set var="showCombinedDownloads"  value="${setting.showCombinedDownloads.toBoolean}" />
<c:set var="useVisualFromParagraph" value="${setting.keyPieceOrigin.useDefault('subsitute').toString ne 'none'}" />

<c:set var="showLocation"           value="${setting.showLocation.toBoolean}" />
<c:set var="bookingOption"          value="${setting.bookingOption.toString}" />
<c:set var="performerOption"        value="${setting.performerOption.toString}" />
<c:set var="showiCalendar"          value="${setting.iCalendarShowLink.toBoolean}" />
<c:set var="showCosts"              value="${setting.showCosts.toBoolean and not empty content.valueList.Costs}" />

<c:set var="dateFormat"             value="${setting.dateFormat.toString}" />
<c:set var="datePrefix"             value="${fn:substringBefore(dateFormat, '|')}" />
<c:set var="dateFormat"             value="${empty datePrefix ? dateFormat : fn:substringAfter(dateFormat, '|')}" />

<mercury:paragraph-split
    paragraphs="${content.valueList.Paragraph}"
    splitFirst="${false}"
    splitDownloads="${showCombinedDownloads}">

<mercury:location-vars data="${value.AddressChoice}" test="${showLocation}">

<c:set var="intro"                  value="${value.Intro}" />
<c:set var="title"                  value="${value.Title}" />
<c:set var="preface"                value="${value.Preface}" />
<c:set var="useVisualFromParagraph" value="${useVisualFromParagraph and not value.Image.value.Image.isSet and firstParagraph.value.Image.isSet}" />
<c:set var="image"                  value="${value.Image.value.Image.isSet ? value.Image : (useVisualFromParagraph ? firstParagraph.value.Image : null)}" />
<c:set var="locationNote"           value="${value.LocationNote}" />
<c:set var="type"                   value="${value.Type}" />
<c:set var="performer"              value="${value.Performer}" />

<c:set var="hasVirtualLocation"     value="${value.VirtualLocation.value.URI.isSet}" />
<c:set var="showLocation"           value="${showLocation and (not empty locData or locationNote.isSet or hasVirtualLocation)}" />
<c:set var="showType"               value="${type.isSet}" />
<c:set var="showPerformer"          value="${performerOption ne 'none'}" />
<c:set var="showOverlay"            value="${keyPieceLayout == 50}" />
<c:set var="seriesInfo"             value="${value.Dates.toDateSeries}" />
<c:set var="date">
    <mercury:instancedate date="${seriesInfo.instanceInfo.get(param.instancedate)}" format="${dateFormat}" />
</c:set>
<c:set var="showDate"               value="${not empty date}" />
<c:set var="ade"                    value="${cms.isEditMode and (empty cms.detailContentId or (not empty date) and (seriesInfo.isExtractedDate or seriesInfo.isSingleDate))}" />

<mercury:nl />
<div class="detail-page type-event layout-${keyPieceLayout}${setCssWrapper123}"><%----%>
<mercury:nl />

<c:set var="keyPieceLayout"         value="${showOverlay ? 0 : keyPieceLayout}" />

<mercury:event-booking
    content="${content}"
    bookingOption="${bookingOption}"
    test="${seriesInfo.isExtractedDate or seriesInfo.isSingleDate}">

    <mercury:piece
        cssWrapper="detail-visual${setCssWrapperKeyPiece}"
        pieceLayout="${keyPieceLayout}"
        allowEmptyBodyColumn="${image.isSet}"
        sizeDesktop="${(keyPieceLayout < 2 || keyPieceLayout == 10) ? 12 : 6}"
        sizeMobile="${12}">

        <jsp:attribute name="heading">
            <c:if test="${not showOverlay}">
                <mercury:intro-headline intro="${intro}" headline="${title}" level="${hsize}" ade="${ade}"/>
                <mercury:heading text="${preface}" level="${7}" css="sub-header" ade="${ade}" test="${keyPieceLayout == 0}" />
            </c:if>
        </jsp:attribute>

        <jsp:attribute name="visual">
            <mercury:key-visual-piece
                image="${image}"
                showOverlay="${showOverlay}"
                effect="${setEffect}"
                imageRatio="${imageRatio}"
                showImageSubtitle="${showImageSubtitle}"
                showImageZoom="${showImageZoom}"
                showImageCopyright="${showImageCopyright}"
                ade="${ade}">
                <jsp:attribute name="markupHeading">
                    <mercury:intro-headline intro="${intro}" headline="${title}" level="${hsize}"/>
                </jsp:attribute>
            </mercury:key-visual-piece>
        </jsp:attribute>

        <jsp:attribute name="text">
            <mercury:heading text="${preface}" level="${7}" css="sub-header" ade="${ade}" test="${not showOverlay and (keyPieceLayout > 1)}" />

            <c:if test="${showDate or showLocation or showType or showPerformer}">
                <c:if test="${showPerformer}">
                    <c:choose>
                        <c:when test="${value.Performer.isSet}">
                            <c:set var="performer" value="${value.Performer.toString}" />
                            <c:set var="showPerformer" value="${performer ne 'none'}" />
                        </c:when>
                        <c:when test="${performerOption eq 'sitename'}">
                            <c:set var="sourceSite" value="${cms.vfs.readSubsiteFor(cms.element.sitePath)}" />
                            <c:set var="sourceSiteProps" value="${cms.vfs.readProperties[sourceSite]}" />
                            <c:set var="performer" value="${not empty sourceSiteProps['mercury.sitename'] ? sourceSiteProps['mercury.sitename'] : sourceSiteProps['Title'] }" />
                        </c:when>
                        <c:otherwise>
                            <c:set var="showPerformer" value="${false}" />
                        </c:otherwise>
                    </c:choose>
                </c:if>
                <div class="visual-info ${not showLocation ? 'right' : ''}"><%----%>
                    <div class="infogroup">
                        <c:if test="${showDate}">
                            <div class="info date"><%----%>
                                <span class="sr-only"><fmt:message key="msg.page.sr.date" /></span><%----%>
                                <div>${datePrefix}${date}</div><%----%>
                            </div><%----%>
                        </c:if>
                        <c:if test="${showType}">
                            <div class="info type"><%----%>
                                <span class="sr-only"><fmt:message key="msg.page.sr.type" /></span><%----%>
                                <div>${type}</div><%----%>
                            </div><%----%>
                        </c:if>
                        <c:if test="${showPerformer}">
                            <div class="info person"><%----%>
                                <span class="sr-only"><fmt:message key="msg.page.sr.by" /></span><%----%>
                                <div ${value.Performer.isSet ? value.Performer.rdfaAttr : ''}>${performer}</div><%----%>
                            </div><%----%>
                        </c:if>
                    </div><%----%>
                    <mercury:nl />
                    <c:if test="${showLocation}">
                        <div class="info location"><%----%>
                            <span class="sr-only"><fmt:message key="msg.page.sr.location" /></span><%----%>
                            <div class="locdata"><%----%>
                                <c:if test="${hasVirtualLocation}">
                                     <div class="onlineInfo"><%----%>
                                        <mercury:link link="${value.VirtualLocation}" text="${value.VirtualLocation.value.URI.isSet ? value.VirtualLocation.value.URI.toLink : ''}" noExternalMarker="${true}" />
                                     </div><%----%>
                                </c:if>
                                <c:if test="${not empty locData}">
                                    <c:if test="${not empty locData.name}">
                                        <div class="locname">${locData.name}</div><%----%>
                                    </c:if>
                                    <div class="address"><%----%>
                                        <div class="street"> ${locData.streetAddress}</div><%----%>
                                        <c:if test="${not empty locData.extendedAddress}">
                                            <div class="extended"> ${locData.extendedAddress}</div><%----%>
                                        </c:if>
                                        <div class="city"><%----%>
                                            <span class="code"> ${locData.postalCode}</span><%----%>
                                            <span class="locality"> ${locData.locality}</span><%----%>
                                        </div>
                                        <div class="region"><%----%>
                                            <c:if test="${not empty locData.region}">
                                                <span class="region"> ${locData.region}</span><%----%>
                                            </c:if>
                                            <c:if test="${not empty locData.country}">
                                                <span class="country"> ${locData.country}</span><%----%>
                                            </c:if>
                                        </div><%----%>
                                    </div><%----%>
                                </c:if>
                                <c:if test="${locationNote.isSet}">
                                    <div class="adressInfo" ${ade ? loocationNote.rdfaAttr : ''}>${locationNote}</div><%----%>
                                </c:if>
                            </div><%----%>
                            <mercury:nl />
                        </div><%----%>
                    </c:if>
                </div><%----%>
            </c:if>

            <mercury:heading text="${preface}" level="${7}" css="sub-header" ade="${ade}" test="${showOverlay or (keyPieceLayout == 1)}" />
        </jsp:attribute>

    </mercury:piece>

    <c:if test="${showCosts}"><%----%>
        <div class="detail-content event-costs pivot"><%----%>

            <fmt:message key="msg.page.event.costs" var="costHeading" />
            <mercury:heading level="${hsize+1}" text="${costHeading}" css="ev-cost-heading" />

            <div class="cost-table"><%----%>
                <c:forEach var="costs" items="${content.valueList.Costs}">
                    <div class="ct-category"><%----%>
                        <div class="ct-price"><%----%>
                            <c:set var="priceVal" value="${cms.wrap[fn:replace(costs.value.Price.toString, ',', '.')].toFloat}" />
                            <c:set var="currencyVal" value="${empty costs.value.Currency ? 'EUR' : costs.value.Currency}" />
                            <c:catch var ="formatException">
                                <fmt:formatNumber value="${priceVal}" currencyCode="${currencyVal}" type="currency" />
                            </c:catch>
                            <c:if test="${not empty formatException}">
                                <fmt:formatNumber value="${priceVal}" currencyCode="EUR" type="currency" />
                            </c:if>
                        </div><%----%>
                        <div class="ct-class"><%----%>
                            <c:out value="${costs.value.Label}" />
                        </div><%----%>
                        <c:if test="${costs.value.LinkToPaymentService.isSet}">
                            <div class="ct-link"><%----%>
                                <mercury:link link="${costs.value.LinkToPaymentService}" />
                            </div><%----%>
                        </c:if>
                    </div><%----%>
                </c:forEach>
            </div><%----%>
        </div><%----%>
        <mercury:nl />
    </c:if>

    <c:if test="${not empty paragraphsContent or not empty paragraphsDownload}">
        <div class="detail-content"><%----%>
            <mercury:paragraphs-alternating
                paragraphs="${paragraphsContent}"
                baseLayout="${pieceLayout}"
                layoutAlternating="${pieceLayoutAlternating}"
                skipFirstParagraphImage="${useVisualFromParagraph}">
                <mercury:section-piece
                    cssWrapper="${setCssWrapperParagraphs}"
                    pieceLayout="${paragraphLayout}"
                    sizeDesktop="${pieceLayoutSizeDesktop}"
                    heading="${paragraph.value.Caption}"
                    image="${status.first and useVisualFromParagraph ? null : paragraph.value.Image}"
                    imageRatio="${imageRatioParagraphs}"
                    text="${paragraph.value.Text}"
                    link="${paragraph.value.Link}"
                    showImageZoom="${showImageZoom}"
                    showImageSubtitle="${showImageSubtitle}"
                    showImageCopyright="${showImageCopyright}"
                    hsize="${hsize + 1}"
                    ade="${ade}"
                    emptyWarning="${not status.first}"
                />
            </mercury:paragraphs-alternating>
            <mercury:paragraph-downloads paragraphs="${paragraphsDownload}" hsize="${hsize + 1}" />
        </div><%----%>
        <mercury:nl />
    </c:if>

    <c:if test="${showiCalendar}">
        <mercury:icalendar-vars content="${content}">
            <div class="detail-addition element pivot ical-link"><%----%>
                <a class="btn" download="${iCalFileName}" href="${iCalLink}">${iCalLabel}</a><%----%>
            </div><%----%>
        </mercury:icalendar-vars>
        <mercury:nl />
    </c:if>

    <mercury:container-attachment content="${content}" name="attachments" type="${containerType}" />

    <c:if test="${showBookingForm}">
        <cms:include file="/system/modules/alkacon.mercury.webform/elements/webform-booking.jsp">
            <cms:param name="formInfo"      value="${content.value.Booking.value.Webform}" />
            <cms:param name="bookingInfo"   value="${content.id}" />
            <cms:param name="bookingOption" value="${bookingOption}" />
            <cms:param name="bookingFormId" value="${bookingFormId}" />
        </cms:include>
    </c:if>

    <mercury:data-event content="${content}" date="${value.Dates.toDateSeries.instanceInfo.get(param.instancedate)}" />

</mercury:event-booking>

</div><%----%>
<mercury:nl />

</mercury:location-vars>
</mercury:paragraph-split>

</mercury:setting-defaults>

</cms:bundle>
</cms:formatter>

</mercury:init-messages>
