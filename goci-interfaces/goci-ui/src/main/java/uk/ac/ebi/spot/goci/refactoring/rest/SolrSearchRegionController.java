package uk.ac.ebi.spot.goci.refactoring.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.goci.refactoring.dto.*;
import uk.ac.ebi.spot.goci.refactoring.model.*;
import uk.ac.ebi.spot.goci.refactoring.service.*;
import uk.ac.ebi.spot.goci.refactoring.util.FileHandler;
import uk.ac.ebi.spot.goci.refactoring.util.SolrQueryParamBuilder;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = SearchUIConstants.API_V2+SearchUIConstants.REGIONS)
public class SolrSearchRegionController {

    @Autowired
    SolrQueryParamBuilder solrQueryParamBuilder;
    @Autowired
    SolrSearchAssociationService solrSearchAssociationService;
    @Autowired
    AssociationSolrDTOAssembler associationSolrDTOAssembler;
    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    SolrRegionService solrRegionService;
    @Autowired
    SolrSearchStudyService solrSearchService;
    @Autowired
    SolrSearchEFOTraitsService solrSearchEFOTraitsService;
    @Autowired
    StudySolrDTOAssembler studySolrDTOAssembler;
    @Autowired
    EFOTraitSolrDTOAssembler efoTraitSolrDTOAssembler;

    @Autowired
    SolrTableExportService solrTableExportService;
    @Autowired
    FileHandler fileHandler;

    @GetMapping(value = "/{regionId}/associations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ResponseEntity<CollectionModel<AssociationSolrDTO>> searchAssociations(SearchAssociationDTO searchAssociationDTO,
                                                                                  @PathVariable String regionId,
                                                                                  @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                                                  PagedResourcesAssembler<AssociationDoc> assembler) throws IOException {
        String query = "";
        if(solrQueryParamBuilder.checkCytoBandPattern(regionId)) {
            query = regionId;
        } else {
            query = solrQueryParamBuilder.buildQueryParam("REGION", regionId);
        }
        Page<AssociationDoc> pageAsssns = solrSearchAssociationService.searchAssociations(query, pageable, searchAssociationDTO);
        PagedModel<AssociationSolrDTO> pagedModel = assembler.toModel(pageAsssns, associationSolrDTOAssembler);
        return new ResponseEntity<>(pagedModel, HttpStatus.OK);
    }

    @GetMapping(value = "/{regionId}/studies", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ResponseEntity<CollectionModel<StudySolrDTO>> searchStudies(SearchStudyDTO searchStudyDTO,
                                                      @PathVariable String regionId,
                                                      @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                      PagedResourcesAssembler<StudyDoc> assembler) throws IOException {
        String query = "";
        if(solrQueryParamBuilder.checkCytoBandPattern(regionId)) {
            query = regionId;
        } else {
            query = solrQueryParamBuilder.buildQueryParam("REGION", regionId);
            List<AssociationDoc> associationDocs = solrRegionService.searchAssociations(query);
            Set<String> accIds = associationDocs.stream().map(associationDoc -> associationDoc.getAccessionId()).collect(Collectors.toSet());
            query = solrQueryParamBuilder.buildAccessionIdQueryParam(accIds);
        }
        Page<StudyDoc> pageStudyDocs = solrSearchService.searchStudies(query, pageable, searchStudyDTO);
        PagedModel<StudySolrDTO> pagedModel = assembler.toModel(pageStudyDocs, studySolrDTOAssembler);
        return new ResponseEntity<>(pagedModel, HttpStatus.OK);
    }

    @GetMapping(value = "/{regionId}/traits", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ResponseEntity<CollectionModel<EFOTraitSolrDTO>>  searchEFOTraits(SearchEFOTraitDTO searchEFOTraitDTO,
                                                           @PathVariable String regionId,
                                                           @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                           PagedResourcesAssembler<EFOTraitDoc> assembler) throws IOException {
        String query = "";
        if(solrQueryParamBuilder.checkCytoBandPattern(regionId)) {
            query = regionId;
        } else {
            query = solrQueryParamBuilder.buildQueryParam("REGION", regionId);
        }
        Page<EFOTraitDoc> efoTraitDocs = solrSearchEFOTraitsService.searchEFOTraits(searchEFOTraitDTO, query, pageable);
        PagedModel<EFOTraitSolrDTO> pagedModel = assembler.toModel(efoTraitDocs, efoTraitSolrDTOAssembler);
        return new ResponseEntity<>(pagedModel, HttpStatus.OK);
    }

    @GetMapping(value = "/{regionId}/studies/download", produces = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadStudies(SearchStudyDTO searchStudyDTO,
                                              @PathVariable String regionId,
                                              @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query = "";
        if(solrQueryParamBuilder.checkCytoBandPattern(regionId)) {
            query = regionId;
        } else {
            query = solrQueryParamBuilder.buildQueryParam("REGION", regionId);
        }
        List<StudyDoc> studyDocList = solrTableExportService.fetchStudies(query, searchStudyDTO, pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readStudyHeaderContent(studyDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=region_studies_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);

    }

    @GetMapping(value = "/{regionId}/associations/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadAssociations(SearchAssociationDTO searchAssociationDTO,
                                                   @PathVariable String regionId,
                                                   @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query = "";
        if(solrQueryParamBuilder.checkCytoBandPattern(regionId)) {
            query = regionId;
        } else {
            query = solrQueryParamBuilder.buildQueryParam("REGION", regionId);
        }
        List<AssociationDoc> asscnDocList = solrTableExportService.fetchAssociations(query, searchAssociationDTO,  pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readAssociationHeaderContent(asscnDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=region_associations_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);
    }


    @GetMapping(value = "/{regionId}/traits/download", produces = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadEFOTraits(SearchEFOTraitDTO searchEFOTraitDTO,
                                                @PathVariable String regionId,
                                                @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query = "";
        if(solrQueryParamBuilder.checkCytoBandPattern(regionId)) {
            query = regionId;
        } else {
            query = solrQueryParamBuilder.buildQueryParam("REGION", regionId);
        }
        List<EFOTraitDoc> efoDocList = solrTableExportService.fetchEFOTraits(query, searchEFOTraitDTO, pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readEFOHeaderContent(efoDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=region_traits_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);
    }

}
