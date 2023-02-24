package uk.ac.ebi.spot.goci.refactoring.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceAssembler;
import org.springframework.hateoas.core.Relation;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.model.EFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.rest.SolrSearchPublicationController;
import uk.ac.ebi.spot.goci.refactoring.rest.SolrSearchStudyController;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;
import uk.ac.ebi.spot.goci.util.BackendUtil;

import java.io.IOException;

@Component
public class EFOTraitSolrDTOAssembler implements ResourceAssembler<EFOTraitDoc, Resource<EFOTraitSolrDTO>> {

    private static final Logger log = LoggerFactory.getLogger(EFOTraitSolrDTOAssembler.class);
    @Autowired
    SearchConfiguration searchConfiguration;

    @Override
    public Resource<EFOTraitSolrDTO> toResource(EFOTraitDoc efoTraitDoc) {
        EFOTraitSolrDTO efoTraitSolrDTO = EFOTraitSolrDTO.builder()
                .efoTraits(efoTraitDoc.getEfoTraits())
                .reportedTrait(efoTraitDoc.getReportedTrait())
                .efoTraits(efoTraitDoc.getEfoTraits())
                .associationCount(efoTraitDoc.getAssociationCount())
                .build();

        try {
            final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(
                    ControllerLinkBuilder.methodOn(SolrSearchStudyController.class).searchEFOTraits(null, efoTraitDoc.getVariantId(), null, null));
            Resource<EFOTraitSolrDTO> resource = new Resource<>(efoTraitSolrDTO);
            resource.add(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).withRel(SearchUIConstants.LINKS_PARENT));
            return resource;
        } catch (IOException ex) {
            log.error("IO Exception " + ex.getMessage(), ex);
        }
        return null;
    }

}
