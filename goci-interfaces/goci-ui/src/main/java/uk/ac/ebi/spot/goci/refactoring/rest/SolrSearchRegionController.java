package uk.ac.ebi.spot.goci.refactoring.rest;

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
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.goci.refactoring.dto.*;
import uk.ac.ebi.spot.goci.refactoring.model.*;
import uk.ac.ebi.spot.goci.refactoring.service.SolrRegionService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchAssociationService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchEFOTraitsService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchStudyService;
import uk.ac.ebi.spot.goci.refactoring.util.SolrQueryParamBuilder;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;
import uk.ac.ebi.spot.goci.util.BackendUtil;

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

    @GetMapping(value = "/{regionId}/associations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<AssociationSolrDTO> searchAssociations(SearchAssociationDTO searchAssociationDTO,
                                                                 @PathVariable String regionId,
                                                                 @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                                 PagedResourcesAssembler assembler) throws IOException {
        String query = "";
        if(solrQueryParamBuilder.checkCytoBandPattern(regionId)) {
            query = regionId;
        } else {
            query = solrQueryParamBuilder.buildQueryParam("REGION", regionId);
        }
        Page<AssociationDoc> pageAsssns = solrSearchAssociationService.searchAssociations(query, pageable, searchAssociationDTO);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchRegionController.class).searchAssociations(searchAssociationDTO, regionId, pageable, assembler));
        return assembler.toResource(pageAsssns, associationSolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));

    }

    @GetMapping(value = "/{regionId}/studies", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<StudySolrDTO> searchStudies(SearchStudyDTO searchStudyDTO,
                                                      @PathVariable String regionId,
                                                      @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                      PagedResourcesAssembler assembler) throws IOException {
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
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchRegionController.class).searchStudies(searchStudyDTO, regionId, pageable, assembler));
        return assembler.toResource(pageStudyDocs, studySolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));


    }
    @GetMapping(value = "/{regionId}/traits", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<EFOTraitSolrDTO> searchEFOTraits(SearchEFOTraitDTO searchEFOTraitDTO,
                                                           @PathVariable String regionId,
                                                           @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                           PagedResourcesAssembler assembler) throws IOException {
        String query = "";
        if(solrQueryParamBuilder.checkCytoBandPattern(regionId)) {
            query = regionId;
        } else {
            query = solrQueryParamBuilder.buildQueryParam("REGION", regionId);
        }
        Page<EFOTraitDoc> efoTraitDocs = solrSearchEFOTraitsService.searchEFOTraits(searchEFOTraitDTO, query, pageable);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchRegionController.class).searchEFOTraits( searchEFOTraitDTO, regionId, pageable, assembler));
        return assembler.toResource(efoTraitDocs, efoTraitSolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));
    }

}
