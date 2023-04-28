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
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = SearchUIConstants.API_V2+SearchUIConstants.VARIANTS)
public class SolrSearchVariantController {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchVariantController.class);

    @Autowired
    SolrSearchStudyService solrSearchService;

    @Autowired
    StudySolrDTOAssembler studySolrDTOAssembler;
    @Autowired
    SearchConfiguration searchConfiguration;
    @Autowired
    SolrSearchEFOTraitsService solrSearchEFOTraitsService;
    @Autowired
    SolrSearchAssociationService solrSearchAssociationService;
    @Autowired
    EFOTraitSolrDTOAssembler efoTraitSolrDTOAssembler;
    @Autowired
    AssociationSolrDTOAssembler associationSolrDTOAssembler;
    @Autowired
    SolrQueryParamBuilder solrQueryParamBuilder;

    @Autowired
    SolrTableExportService solrTableExportService;
    @Autowired
    FileHandler fileHandler;

    @GetMapping(value = "/{variantId}/studies", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<StudySolrDTO> searchStudies(SearchStudyDTO searchStudyDTO,
                                                      @PathVariable String variantId,
                                                      @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                      PagedResourcesAssembler assembler) throws IOException {
        log.info(" Inside  searchStudies ");
       String query = solrQueryParamBuilder.buildQueryParam("VARIANT",variantId);
       Page<StudyDoc> pageStudyDocs = solrSearchService.searchStudies(query,pageable,searchStudyDTO);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchVariantController.class).searchStudies(searchStudyDTO, variantId, pageable, assembler));
        return assembler.toResource(pageStudyDocs, studySolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));

    }


    @GetMapping(value = "/{variantId}/associations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<AssociationSolrDTO> searchAssociations(SearchAssociationDTO searchAssociationDTO,
                                                                 @PathVariable String variantId,
                                                                 @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                                 PagedResourcesAssembler assembler) throws IOException {
        log.info(" Inside  searchAssociations ");
        String query = solrQueryParamBuilder.buildQueryParam("VARIANT",variantId);
        Page<AssociationDoc> pageAsscnDocs = solrSearchAssociationService.searchAssociations(query, pageable, searchAssociationDTO);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchPublicationController.class).searchAssociations(searchAssociationDTO, variantId, pageable, assembler));
        return assembler.toResource(pageAsscnDocs, associationSolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));


    }

    @GetMapping(value = "/{variantId}/traits", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
   public PagedResources<AssociationSolrDTO> searchEFOTraits(SearchEFOTraitDTO searchEFOTraitDTO,
                                                             @PathVariable String variantId,
                                                             @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                             PagedResourcesAssembler assembler) throws IOException {
        log.info(" Inside  searchEFOTraits ");
        String query = solrQueryParamBuilder.buildQueryParam("VARIANT",variantId);
       Page<EFOTraitDoc> efoTraitDocs = solrSearchEFOTraitsService.searchEFOTraits(searchEFOTraitDTO, query, pageable);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchVariantController.class).searchEFOTraits( searchEFOTraitDTO, variantId, pageable, assembler));
        return assembler.toResource(efoTraitDocs, efoTraitSolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));

    }

    @GetMapping(value = "/{variantId}/studies/download", produces = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadStudies(@PathVariable String variantId) {
        String query = solrQueryParamBuilder.buildQueryParam("VARIANT",variantId);
        List<StudyDoc> studyDocList = solrTableExportService.fetchStudies(query);
        byte[] result = fileHandler.serializePojoToTsv(studyDocList.stream()
                .map(studyDoc -> studySolrDTOAssembler.assemble(studyDoc))
                        .collect(Collectors.toList()));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=studyTableExport.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);

    }


    @GetMapping(value = "/{variantId}/associations/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadAssociations(@PathVariable String variantId) {
        String query = solrQueryParamBuilder.buildQueryParam("VARIANT",variantId);
        List<AssociationDoc> asscnDocList = solrTableExportService.fetchAssociations(query);
        byte[] result = fileHandler.serializePojoToTsv(asscnDocList.stream()
                .map(asscnDoc -> associationSolrDTOAssembler.assemble(asscnDoc))
                .collect(Collectors.toList()));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=asscnTableExport.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);
    }


    @GetMapping(value = "/{variantId}/traits/download", produces = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadEFOTraits(@PathVariable String variantId) {
        String query = solrQueryParamBuilder.buildQueryParam("VARIANT",variantId);
        List<EFOTraitDoc> efoDocList = solrTableExportService.fetchEFOTraits(query);
        byte[] result = fileHandler.serializePojoToTsv(efoDocList.stream()
                .map(efoDoc -> efoTraitSolrDTOAssembler.assemble(efoDoc))
                .collect(Collectors.toList()));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=efoTableExport.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);
    }

}
