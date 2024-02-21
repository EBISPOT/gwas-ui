package uk.ac.ebi.spot.goci.refactoring.dto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;
import uk.ac.ebi.spot.goci.refactoring.model.EFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.rest.SolrSearchVariantController;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class EFOTraitSolrDTOAssembler extends RepresentationModelAssemblerSupport<EFOTraitDoc, EFOTraitSolrDTO> {

    private static final Logger log = LoggerFactory.getLogger(EFOTraitSolrDTOAssembler.class);
    @Autowired
    SearchConfiguration searchConfiguration;

    public EFOTraitSolrDTOAssembler() {
        super(SolrSearchVariantController.class, EFOTraitSolrDTO.class);
    }

    @Override
    public EFOTraitSolrDTO toModel(EFOTraitDoc efoTraitDoc) {
        EFOTraitSolrDTO efoTraitSolrDTO = assemble(efoTraitDoc);
        efoTraitSolrDTO.add(linkTo(methodOn(SolrSearchVariantController.class)).withSelfRel());
        return efoTraitSolrDTO;

//        try {
//            final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(
//                    ControllerLinkBuilder.methodOn(SolrSearchVariantController.class).searchEFOTraits(null, "rs123456", null, null));
//            Resource<EFOTraitSolrDTO> resource = new Resource<>(efoTraitSolrDTO);
//            resource.add(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).withSelfRel());
//            return resource;
//        } catch (IOException ex) {
//            log.error("IO Exception " + ex.getMessage(), ex);
//        }
//        return null;
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
