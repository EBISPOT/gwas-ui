package uk.ac.ebi.spot.goci.refactoring.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.goci.refactoring.dto.StudySolrDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.StudySolrDTOAssembler;
import uk.ac.ebi.spot.goci.refactoring.model.SearchStudyDTO;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchSumstatsService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrTableExportService;
import uk.ac.ebi.spot.goci.refactoring.util.FileHandler;
import uk.ac.ebi.spot.goci.refactoring.util.SolrQueryParamBuilder;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;
import uk.ac.ebi.spot.goci.util.BackendUtil;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = SearchUIConstants.API_V2+SearchUIConstants.SUMMARY_STATISTICS)
public class SolrSearchSummaryStatsController {

    @Autowired
    SolrQueryParamBuilder solrQueryParamBuilder;
    @Autowired
    SolrSearchSumstatsService solrSearchSumstatsService;
    @Autowired
    StudySolrDTOAssembler studySolrDTOAssembler;
    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    SolrTableExportService solrTableExportService;
    @Autowired
    FileHandler fileHandler;

    @GetMapping(value = "/studies", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<StudySolrDTO> searchStudies(SearchStudyDTO searchStudyDTO,
                                                      @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                      PagedResourcesAssembler assembler) throws IOException {

        String query= solrQueryParamBuilder.buildQueryParam("SUMSTATS",null);
        //log.info("Query for EFO Traits is->"+query);
        Page<StudyDoc> pageStudyDocs = solrSearchSumstatsService.searchStudies(query, pageable, searchStudyDTO);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchSummaryStatsController.class).searchStudies(searchStudyDTO, pageable, assembler));
        return assembler.toResource(pageStudyDocs, studySolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));

    }

    @GetMapping(value = "/studies/download", produces = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadStudies(SearchStudyDTO searchStudyDTO,
                                              @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query= solrQueryParamBuilder.buildQueryParam("SUMSTATS",null);
        List<StudyDoc> studyDocList = solrTableExportService.fetchStudies(query, searchStudyDTO, pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readStudyHeaderContent(studyDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=summary_statistics_table_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);

    }
}
