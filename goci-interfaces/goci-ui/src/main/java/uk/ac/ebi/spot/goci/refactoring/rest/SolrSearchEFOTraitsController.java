package uk.ac.ebi.spot.goci.refactoring.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.data.web.SortDefault;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.MediaTypes;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.goci.refactoring.dto.AssociationSolrDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.AssociationSolrDTOAssembler;
import uk.ac.ebi.spot.goci.refactoring.dto.StudySolrDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.StudySolrDTOAssembler;
import uk.ac.ebi.spot.goci.refactoring.model.*;
import uk.ac.ebi.spot.goci.refactoring.service.*;
import uk.ac.ebi.spot.goci.refactoring.util.FileHandler;
import uk.ac.ebi.spot.goci.refactoring.util.SolrQueryParamBuilder;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;
import uk.ac.ebi.spot.goci.util.BackendUtil;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping(value = SearchUIConstants.API_V2+SearchUIConstants.EFOTRAITS)
public class SolrSearchEFOTraitsController {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchEFOTraitsController.class);
    @Autowired
    RestAPIEFOService restAPIEFOService;
    @Autowired
    SolrSearchEFOTraitService solrSearchEFOTraitService;

    @Autowired
    SolrSearchStudyService solrSearchService;

    @Autowired
    SolrSearchAssociationService solrSearchAssociationService;
    @Autowired
    StudySolrDTOAssembler studySolrDTOAssembler;

    @Autowired
    AssociationSolrDTOAssembler associationSolrDTOAssembler;

    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    SolrQueryParamBuilder solrQueryParamBuilder;
    @Autowired
    SolrTableExportService solrTableExportService;

    @Autowired
    FileHandler fileHandler;

    @GetMapping(value = "/{efotraitId}/studies", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ResponseEntity<CollectionModel<StudySolrDTO>> searchStudies(SearchStudyDTO searchStudyDTO,
                                                      @PathVariable String efotraitId,
                                                      @RequestParam(value = SearchUIConstants.INCLUDE_CHILD_TRAITS, required = false) Boolean includeChildTraits,
                                                      @RequestParam(value = SearchUIConstants.INCLUDE_BG_TRAITS, required = false) Boolean includeBgTraits,
                                                      @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                      PagedResourcesAssembler<StudyDoc> assembler) throws IOException {
        String query = "";
        if(includeChildTraits != null && includeChildTraits) {
            Map<String, String> olsTerms = solrSearchEFOTraitService.getOLSTerms(efotraitId);
            List<String> efotraits = null;
            if (olsTerms != null) {
                efotraits = solrSearchEFOTraitService.getChildTraits(olsTerms);
            } else {
                efotraits = new ArrayList<>();
            }
            efotraits.add(efotraitId);
            query = solrQueryParamBuilder.buildEFOQueryParam(efotraits, includeBgTraits);
        } else {
            if(includeBgTraits) {
                query = solrQueryParamBuilder.buildQueryParam("BGTRAIT", efotraitId);
            } else {
                query = solrQueryParamBuilder.buildQueryParam("EFOTRAIT", efotraitId);
            }
        }

        Page<StudyDoc> pageStudyDocs = solrSearchService.searchStudies(query, pageable, searchStudyDTO);
        PagedModel<StudySolrDTO> pagedModel = assembler.toModel(pageStudyDocs, studySolrDTOAssembler);
        return new ResponseEntity<>(pagedModel, HttpStatus.OK);
    }


    @GetMapping(value = "/{efotraitId}/associations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ResponseEntity<CollectionModel<AssociationSolrDTO>> searchAssociations(SearchAssociationDTO searchAssociationDTO,
                                                                 @PathVariable String efotraitId,
                                                                 @RequestParam(value = SearchUIConstants.INCLUDE_CHILD_TRAITS, required = false) Boolean includeChildTraits,
                                                                 @RequestParam(value = SearchUIConstants.INCLUDE_BG_TRAITS, required = false) Boolean includeBgTraits,
                                                                 @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                                 PagedResourcesAssembler<AssociationDoc> assembler) throws IOException {
        String query = "";
        if(includeChildTraits != null && includeChildTraits) {
            Map<String, String> olsTerms = solrSearchEFOTraitService.getOLSTerms(efotraitId);
            List<String> efotraits = solrSearchEFOTraitService.getChildTraits(olsTerms);
            efotraits.add(efotraitId);
            query = solrQueryParamBuilder.buildEFOQueryParam(efotraits, includeBgTraits);
        } else {
            if(includeBgTraits) {
                query = solrQueryParamBuilder.buildQueryParam("BGTRAIT", efotraitId);
            } else {
                query = solrQueryParamBuilder.buildQueryParam("EFOTRAIT", efotraitId);
            }
        }

        log.info("Query for EFO Traits is->"+query);
        Page<AssociationDoc> pageAssociationDocs = solrSearchAssociationService.searchAssociations(query, pageable, searchAssociationDTO );
        PagedModel<AssociationSolrDTO> pagedModel = assembler.toModel(pageAssociationDocs, associationSolrDTOAssembler);
        return new ResponseEntity<>(pagedModel, HttpStatus.OK);
    }

    @GetMapping(value = "/{efotraitId}/traits/children", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ResponseEntity<List<EFOKeyLabel>> getChildTraits(@PathVariable String efotraitId) {
        Map<String, String> olsTerms = solrSearchEFOTraitService.getOLSTerms(efotraitId);
        List<String> efotraits = solrSearchEFOTraitService.getChildTraits(olsTerms);
        List<EFOKeyLabel> efos = solrSearchEFOTraitService.getChildTraitLabels(efotraits);
        efos.sort(Comparator.comparing(efoKeyLabel -> efoKeyLabel.getLabel().toLowerCase()));
        return new ResponseEntity<>(efos, HttpStatus.OK);
    }

    @GetMapping(value = "/{efotraitId}/locuszoom/associations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ResponseEntity<CollectionModel<AssociationSolrDTO>> searchLocusAssociations(@PathVariable(value = "efotraitId") String efotraitId,
                                                                 @RequestParam(value = SearchUIConstants.INCLUDE_CHILD_TRAITS, required = false) Boolean includeChildTraits,
                                                                 @RequestParam(value = SearchUIConstants.INCLUDE_BG_TRAITS, required = false) Boolean includeBgTraits,
                                                                 @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                                 PagedResourcesAssembler<AssociationDoc> assembler) throws IOException {
        String query = "";

        if(includeChildTraits != null && includeChildTraits) {
            Map<String, String> olsTerms = solrSearchEFOTraitService.getOLSTerms(efotraitId);
            List<String> efotraits = solrSearchEFOTraitService.getChildTraits(olsTerms);
            efotraits.add(efotraitId);
            query = solrQueryParamBuilder.buildEFOQueryParam(efotraits, includeBgTraits);
        } else {
            if(includeBgTraits != null ) {
                if(includeBgTraits) {
                    query = solrQueryParamBuilder.buildQueryParam("BGTRAIT", efotraitId);
                } else {
                    query = solrQueryParamBuilder.buildQueryParam("EFOTRAIT", efotraitId);
                }
            } else{
                query = solrQueryParamBuilder.buildQueryParam("EFOTRAIT", efotraitId);
            }
        }

        Page<AssociationDoc> pageAssociationDocs = solrSearchEFOTraitService.searchAssociations(query, pageable );
        PagedModel<AssociationSolrDTO> pagedModel = assembler.toModel(pageAssociationDocs, associationSolrDTOAssembler);
        return new ResponseEntity<>(pagedModel, HttpStatus.OK);
    }


    @GetMapping(value = "/{efotraitId}/studies/download", produces = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadStudies(SearchStudyDTO searchStudyDTO,
                                              @PathVariable String efotraitId,
                                              @RequestParam(value = SearchUIConstants.INCLUDE_CHILD_TRAITS, required = false) Boolean includeChildTraits,
                                              @RequestParam(value = SearchUIConstants.INCLUDE_BG_TRAITS, required = false) Boolean includeBgTraits,
                                              @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query = "";
        if(includeChildTraits != null && includeChildTraits) {
            Map<String, String> olsTerms = solrSearchEFOTraitService.getOLSTerms(efotraitId);
            List<String> efotraits = null;
            if (olsTerms != null) {
                efotraits = solrSearchEFOTraitService.getChildTraits(olsTerms);
            } else {
                efotraits = new ArrayList<>();
            }
            efotraits.add(efotraitId);
            query = solrQueryParamBuilder.buildEFOQueryParam(efotraits, includeBgTraits);
        } else {
            if(includeBgTraits) {
                query = solrQueryParamBuilder.buildQueryParam("BGTRAIT", efotraitId);
            } else {
                query = solrQueryParamBuilder.buildQueryParam("EFOTRAIT", efotraitId);
            }
        }
        List<StudyDoc> studyDocList = solrTableExportService.fetchStudies(query, searchStudyDTO, pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readStudyHeaderContent(studyDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + efotraitId + "_studies_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);

    }

    @GetMapping(value = "/{efotraitId}/associations/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public HttpEntity<byte[]> downloadAssociations(SearchAssociationDTO searchAssociationDTO,
                                                   @PathVariable String efotraitId,
                                                   @RequestParam(value = SearchUIConstants.INCLUDE_CHILD_TRAITS, required = false) Boolean includeChildTraits,
                                                   @RequestParam(value = SearchUIConstants.INCLUDE_BG_TRAITS, required = false) Boolean includeBgTraits,
                                                   @PageableDefault(size = 10, page = 0) Pageable pageable) throws IOException {
        String query = "";
        if(includeChildTraits != null && includeChildTraits) {
            Map<String, String> olsTerms = solrSearchEFOTraitService.getOLSTerms(efotraitId);
            List<String> efotraits = null;
            if (olsTerms != null) {
                efotraits = solrSearchEFOTraitService.getChildTraits(olsTerms);
            } else {
                efotraits = new ArrayList<>();
            }
            efotraits.add(efotraitId);
            query = solrQueryParamBuilder.buildEFOQueryParam(efotraits, includeBgTraits);
        } else {
            if(includeBgTraits) {
                query = solrQueryParamBuilder.buildQueryParam("BGTRAIT", efotraitId);
            } else {
                query = solrQueryParamBuilder.buildQueryParam("EFOTRAIT", efotraitId);
            }
        }

        List<AssociationDoc> asscnDocList = solrTableExportService.fetchAssociations(query, searchAssociationDTO,  pageable);
        byte[] result = fileHandler.serializePojoToTsv(solrTableExportService.readAssociationHeaderContent(asscnDocList));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + efotraitId + "_associations_export.tsv");
        responseHeaders.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        responseHeaders.add(HttpHeaders.CONTENT_LENGTH, Integer.toString(result.length));
        return new HttpEntity<>(result, responseHeaders);
    }

}
