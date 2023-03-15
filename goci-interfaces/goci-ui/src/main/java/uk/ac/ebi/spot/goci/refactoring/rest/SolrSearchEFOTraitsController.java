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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.goci.refactoring.dto.AssociationSolrDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.AssociationSolrDTOAssembler;
import uk.ac.ebi.spot.goci.refactoring.dto.StudySolrDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.StudySolrDTOAssembler;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchAssociationDTO;
import uk.ac.ebi.spot.goci.refactoring.model.SearchStudyDTO;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;
import uk.ac.ebi.spot.goci.refactoring.service.RestAPIEFOService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchAssociationService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchEFOTraitService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchStudyService;
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

    @GetMapping(value = "/{efotraitId}/studies", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<StudySolrDTO> searchStudies(SearchStudyDTO searchStudyDTO,
                                                      @PathVariable String efotraitId,
                                                      @RequestParam(value = SearchUIConstants.INCLUDE_CHILD_TRAITS,
                                                              required = false) Boolean includeChildTraits,
                                                      @RequestParam(value = SearchUIConstants.INCLUDE_BG_TRAITS,
                                                              required = false) Boolean includeBgTraits,
                                                      @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                      PagedResourcesAssembler assembler) throws IOException {
        String query = "";
        if(includeChildTraits != null && includeChildTraits) {
         Map<String, String> olsTerms = solrSearchEFOTraitService.getOLSTerms(efotraitId);
         List<String> efotraits = null;
         if (olsTerms != null) {
             efotraits = solrSearchEFOTraitService.getChildTraits(olsTerms);
         }else {
             efotraits = new ArrayList<>();
         }
         efotraits.add(efotraitId);
         query = solrQueryParamBuilder.buildEFOQueryParam(efotraits);
        } else {
            query = solrQueryParamBuilder.buildQueryParam("EFOTRAIT", efotraitId);
        }
        if(includeBgTraits != null && includeBgTraits) {
            query = solrQueryParamBuilder.buildQueryParam("BGTRAIT", efotraitId);
        }
        log.info("Query for EFO Traits is->"+query);
        Page<StudyDoc> pageStudyDocs = solrSearchService.searchStudies(query, pageable, searchStudyDTO);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchVariantController.class).searchStudies(searchStudyDTO, efotraitId, pageable, assembler));
        return assembler.toResource(pageStudyDocs, studySolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));

    }


    @GetMapping(value = "/{efotraitId}/associations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<AssociationSolrDTO> searchAssociations(SearchAssociationDTO searchAssociationDTO,
                                                                 @PathVariable String efotraitId,
                                                                 @RequestParam(value = SearchUIConstants.INCLUDE_CHILD_TRAITS,
                                                                         required = false) Boolean includeChildTraits,
                                                                 @RequestParam(value = SearchUIConstants.INCLUDE_BG_TRAITS,
                                                                         required = false) Boolean includeBgTraits,
                                                                 @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                                 PagedResourcesAssembler assembler) throws IOException {
        String query = "";
        if(includeChildTraits != null && includeChildTraits) {
            Map<String, String> olsTerms = solrSearchEFOTraitService.getOLSTerms(efotraitId);
            List<String> efotraits = solrSearchEFOTraitService.getChildTraits(olsTerms);
            efotraits.add(efotraitId);
            query = solrQueryParamBuilder.buildEFOQueryParam(efotraits);
        } else {
            query = solrQueryParamBuilder.buildQueryParam("EFOTRAIT", efotraitId);
        }
        if(includeBgTraits != null && includeBgTraits) {
            query = solrQueryParamBuilder.buildQueryParam("BGTRAIT", efotraitId);
        }
        log.info("Query for EFO Traits is->"+query);
        Page<AssociationDoc> pageAssociationDocs = solrSearchAssociationService.searchAssociations(query, pageable, searchAssociationDTO );
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchVariantController.class).searchAssociations(searchAssociationDTO, efotraitId, pageable, assembler));
        return assembler.toResource(pageAssociationDocs, associationSolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));
    }

    @GetMapping(value = "/{efotraitId}/traits/children", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ResponseEntity<List<String>> getChildTraits(@PathVariable String efotraitId) {
        Map<String, String> olsTerms = solrSearchEFOTraitService.getOLSTerms(efotraitId);
        List<String> efotraits = solrSearchEFOTraitService.getChildTraits(olsTerms);
        List<String> efoLabels = solrSearchEFOTraitService.getChildTraitLabels(efotraits);
        efoLabels.sort(Comparator.comparing(String::toLowerCase));
        return new ResponseEntity<>(efoLabels, HttpStatus.OK);
    }
}
