package uk.ac.ebi.spot.goci.refactoring.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import uk.ac.ebi.spot.goci.refactoring.dto.*;
import uk.ac.ebi.spot.goci.refactoring.model.*;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchAssociationService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchEFOTraitsService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchStudyService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrTableExportService;
import uk.ac.ebi.spot.goci.refactoring.util.FileHandler;
import uk.ac.ebi.spot.goci.refactoring.util.SolrQueryParamBuilder;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;
import uk.ac.ebi.spot.goci.util.BackendUtil;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(value = SearchUIConstants.API_V2+SearchUIConstants.GENES)
public class SolrSearchGeneController {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchVariantController.class);

    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    SolrQueryParamBuilder solrQueryParamBuilder;
    @Autowired
    SolrSearchStudyService solrSearchService;
    @Autowired
    SolrSearchAssociationService solrSearchAssociationService;
    @Autowired
    SolrSearchEFOTraitsService solrSearchEFOTraitsService;
    @Autowired
    StudySolrDTOAssembler studySolrDTOAssembler;
    @Autowired
    AssociationSolrDTOAssembler associationSolrDTOAssembler;
    @Autowired
    EFOTraitSolrDTOAssembler efoTraitSolrDTOAssembler;
    @Autowired
    SolrTableExportService solrTableExportService;
    @Autowired
    FileHandler fileHandler;

    @GetMapping(value = "/{geneId}/studies", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<StudySolrDTO> searchStudies(SearchStudyDTO searchStudyDTO,
                                                      @PathVariable String geneId,
                                                      @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                      PagedResourcesAssembler assembler) throws IOException {
        String query = solrQueryParamBuilder.buildQueryParam("GENE", geneId);
        Page<StudyDoc> pageStudyDocs = solrSearchService.searchStudies(query, pageable, searchStudyDTO);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchVariantController.class).searchStudies(searchStudyDTO, geneId, pageable, assembler));
        return assembler.toResource(pageStudyDocs, studySolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));

    }


    @GetMapping(value = "/{geneId}/associations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<AssociationSolrDTO> searchAssociations(SearchAssociationDTO searchAssociationDTO,
                                                                 @PathVariable String geneId,
                                                                 @RequestParam(value = SearchUIConstants.INCLUDE_CHILD_TRAITS,
                                                                         required = false) Boolean includeChildTraits,
                                                                 @RequestParam(value = SearchUIConstants.INCLUDE_BG_TRAITS,
                                                                         required = false) Boolean includeBgTraits,
                                                                 @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                                 PagedResourcesAssembler assembler) throws IOException {
        String query = solrQueryParamBuilder.buildQueryParam("GENE", geneId);
        Page<AssociationDoc> pageAssociationDocs = solrSearchAssociationService.searchAssociations(query, pageable, searchAssociationDTO );
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchVariantController.class).searchAssociations(searchAssociationDTO, geneId, pageable, assembler));
        return assembler.toResource(pageAssociationDocs, associationSolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));
    }


    @GetMapping(value = "/{geneId}/traits", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<EFOTraitSolrDTO> searchEFOTraits(SearchEFOTraitDTO searchEFOTraitDTO,
                                                           @PathVariable String geneId,
                                                           @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                           PagedResourcesAssembler assembler) throws IOException {
        String query = solrQueryParamBuilder.buildQueryParam("GENE", geneId);
        Page<EFOTraitDoc> efoTraitDocs = solrSearchEFOTraitsService.searchEFOTraits(searchEFOTraitDTO, query, pageable);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchRegionController.class).searchEFOTraits( searchEFOTraitDTO, geneId, pageable, assembler));
        return assembler.toResource(efoTraitDocs, efoTraitSolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));
    }


    @GetMapping(value = "/{geneId}/studies/download", produces = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadStudies(SearchStudyDTO searchStudyDTO,
                                              @PathVariable String geneId,
                                              @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query = solrQueryParamBuilder.buildQueryParam("GENE", geneId);
        List<StudyDoc> studyDocList = solrTableExportService.fetchStudies(query, searchStudyDTO, pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readStudyHeaderContent(studyDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + geneId + "_studies_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);

    }

    @GetMapping(value = "/{geneId}/associations/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadAssociations(SearchAssociationDTO searchAssociationDTO,
                                                   @PathVariable String geneId,
                                                   @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query = solrQueryParamBuilder.buildQueryParam("GENE", geneId);
        List<AssociationDoc> asscnDocList = solrTableExportService.fetchAssociations(query, searchAssociationDTO,  pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readAssociationHeaderContent(asscnDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + geneId + "_associations_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);
    }


    @GetMapping(value = "/{geneId}/traits/download", produces = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadEFOTraits(SearchEFOTraitDTO searchEFOTraitDTO,
                                                @PathVariable String geneId,
                                                @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query = solrQueryParamBuilder.buildQueryParam("GENE", geneId);
        List<EFOTraitDoc> efoDocList = solrTableExportService.fetchEFOTraits(query, searchEFOTraitDTO, pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readEFOHeaderContent(efoDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + geneId + "_traits_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);
    }
}


