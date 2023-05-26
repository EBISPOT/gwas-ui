package uk.ac.ebi.spot.goci.refactoring.dto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceAssembler;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;
import uk.ac.ebi.spot.goci.refactoring.model.EFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.rest.SolrSearchVariantController;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.util.BackendUtil;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class EFOTraitSolrDTOAssembler implements ResourceAssembler<EFOTraitDoc, Resource<EFOTraitSolrDTO>> {

    private static final Logger log = LoggerFactory.getLogger(EFOTraitSolrDTOAssembler.class);
    @Autowired
    SearchConfiguration searchConfiguration;

    @Override
    public Resource<EFOTraitSolrDTO> toResource(EFOTraitDoc efoTraitDoc) {
        EFOTraitSolrDTO efoTraitSolrDTO = assemble(efoTraitDoc);

        try {
            final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(
                    ControllerLinkBuilder.methodOn(SolrSearchVariantController.class).searchEFOTraits(null, "rs123456", null, null));
            Resource<EFOTraitSolrDTO> resource = new Resource<>(efoTraitSolrDTO);
            resource.add(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).withSelfRel());
            return resource;
        } catch (IOException ex) {
            log.error("IO Exception " + ex.getMessage(), ex);
        }
        return null;
    }

    public EFOTraitSolrDTO assemble(EFOTraitDoc efoTraitDoc) {
        return EFOTraitSolrDTO.builder()
                .efoTraits(efoTraitDoc.getEfoTraits())
                .reportedTrait(efoTraitDoc.getReportedTrait())
                .associationCount(efoTraitDoc.getAssociationCount())
                .build();
    }


    public EFOTableExportDTO assembleEFOExport(EFOTraitDoc efoTraitDoc) {
        return EFOTableExportDTO.builder()
                .efoTraits(parseLabelsFromEFO(efoTraitDoc.getEfoTraits()))
                .reportedTrait(convertListToString(efoTraitDoc.getReportedTrait()))
                .associationCount(efoTraitDoc.getAssociationCount())
                .build();
    }

    private String parseLabelsFromEFO(List<EFOKeyLabel> efoKeyLabels) {
        if(efoKeyLabels != null) {
            return efoKeyLabels.stream().filter(Objects::nonNull).
                    map(EFOKeyLabel::getLabel).
                    collect(Collectors.joining(","));
        }
        return "-";
    }

    private String convertListToString(List<String> anyList) {
        if(anyList != null) {
            return anyList.stream().collect(Collectors.joining(","));
        }
        return "-";
    }
}
