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
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.goci.refactoring.dto.AssociationSolrDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.EFOTraitSolrDTOAssembler;
import uk.ac.ebi.spot.goci.refactoring.dto.StudySolrDTO;
import uk.ac.ebi.spot.goci.refactoring.dto.StudySolrDTOAssembler;
import uk.ac.ebi.spot.goci.refactoring.model.EFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchEFOTraitDTO;
import uk.ac.ebi.spot.goci.refactoring.model.SearchStudyDTO;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchEFOTraitsService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchService;
import uk.ac.ebi.spot.goci.refactoring.service.impl.RestInteractionServiceImpl;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;
import uk.ac.ebi.spot.goci.util.BackendUtil;

import java.io.IOException;

@RestController
@RequestMapping(value = SearchUIConstants.API_V2+SearchUIConstants.VARIANTS)
public class SolrSearchStudyController {

    private static final Logger log = LoggerFactory.getLogger(RestInteractionServiceImpl.class);

    @Autowired
    SolrSearchService solrSearchService;

    @Autowired
    StudySolrDTOAssembler studySolrDTOAssembler;
    @Autowired
    SearchConfiguration searchConfiguration;
    @Autowired
    SolrSearchEFOTraitsService solrSearchEFOTraitsService;

    @Autowired
    EFOTraitSolrDTOAssembler efoTraitSolrDTOAssembler;

    @GetMapping(value = "/{variantId}/studies", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public PagedResources<StudySolrDTO> searchStudies(SearchStudyDTO searchStudyDTO,
                                                      @PathVariable String variantId,
                                                      @PageableDefault(size = 10, page = 0) Pageable pageable,
                                                      PagedResourcesAssembler assembler) throws IOException {
        log.info(" Inside  searchStudies ");
       Page<StudyDoc> pageStudyDocs = solrSearchService.searchStudies(variantId,pageable,searchStudyDTO);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchStudyController.class).searchStudies(searchStudyDTO, variantId, pageable, assembler));
        return assembler.toResource(pageStudyDocs, studySolrDTOAssembler,
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
       Page<EFOTraitDoc> efoTraitDocs = solrSearchEFOTraitsService.searchEFOTraits(searchEFOTraitDTO, variantId, pageable);
        final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(ControllerLinkBuilder
                .methodOn(SolrSearchStudyController.class).searchEFOTraits( searchEFOTraitDTO, variantId, pageable, assembler));
        return assembler.toResource(efoTraitDocs, efoTraitSolrDTOAssembler,
                new Link(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).toUri().toString()));

    }




}
