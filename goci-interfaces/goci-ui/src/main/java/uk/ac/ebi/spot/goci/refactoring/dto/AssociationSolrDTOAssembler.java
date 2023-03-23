
package uk.ac.ebi.spot.goci.refactoring.dto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceAssembler;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;
import uk.ac.ebi.spot.goci.refactoring.rest.SolrSearchPublicationController;
import uk.ac.ebi.spot.goci.refactoring.util.SolrEntityTransformerUtility;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;
import uk.ac.ebi.spot.goci.util.BackendUtil;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class AssociationSolrDTOAssembler implements ResourceAssembler<AssociationDoc, Resource<AssociationSolrDTO>> {

    private static final Logger log = LoggerFactory.getLogger(StudySolrDTOAssembler.class);

    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    SolrEntityTransformerUtility solrEntityTransformerUtility;

    @Override
    public Resource<AssociationSolrDTO> toResource(AssociationDoc associationDoc) {

        AssociationSolrDTO associationSolrDTO = AssociationSolrDTO.builder()
                .riskAllele(Optional.ofNullable(associationDoc.getStrongestAllele()).map(this::transformRiskAllele)
                        .orElse(null))
                .riskFrequency(associationDoc.getRiskFrequency())
                .pValue(associationDoc.getpValueMantissa())
                .pValueExponent(associationDoc.getpValueExponent())
                .pValueAnnotation(Optional.ofNullable(associationDoc.getQualifier()).map(this::tranformPValueAnnotation)
                        .orElse(null))
                .orValue(Optional.ofNullable(associationDoc.getOrPerCopyNum()).map((orVal) ->
                                this.transformOrValue(orVal, associationDoc.getOrDescription() ))
                        .orElse(null))
                .beta(Optional.ofNullable(associationDoc.getBetaNum()).map((betanum) ->
                        this.transformBeta(betanum, associationDoc.getBetaUnit(),
                        associationDoc.getBetaDirection())).orElse(null))
                .ci(associationDoc.getRange())
                .mappedGenes(Optional.ofNullable(associationDoc.getEnsemblMappedGenes())
                        //.map(this::transformMappedGenes)
                        .orElse(null))
                .traitName(associationDoc.getTraitNames())
                .efoTraits(Optional.ofNullable(associationDoc.getEfoLink())
                        .map(solrEntityTransformerUtility::getEFOLinks).orElse(
                        solrEntityTransformerUtility.getEFOLinksfromUri
                                (associationDoc.getMappedLabel(), associationDoc.getMappedUri())))
                .bgTraits(Optional.ofNullable(associationDoc.getMappedBkgLabel()).map(bglinks ->
                        solrEntityTransformerUtility.getEFOLinksfromUri
                        (associationDoc.getMappedBkgLabel(), associationDoc.getMappedBkgUri()))
                        .orElse(null))
                .locations(Optional.ofNullable(associationDoc.getPositionLinks()).map(this::transformPositionLinks).orElse(null))
                .author(associationDoc.getAuthor_s())
                .publicationDate(Optional.ofNullable(associationDoc.getPublicationDate()).map(solrEntityTransformerUtility::formatPubDate).orElse(null))
                .pubmedId(associationDoc.getPubmedId())
                .accessionId(associationDoc.getAccessionId())
                .riskAlleleSep(Optional.ofNullable(associationDoc.getStrongestAllele()).map(this::getRiskAllelleSep).orElse(null))
                .chromLocation(associationDoc.getChromLocation())
                .build();
        try {
            final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(
                    ControllerLinkBuilder.methodOn(SolrSearchPublicationController.class).searchAssociations(null, "Pmid", null, null));
            Resource<AssociationSolrDTO> resource = new Resource<>(associationSolrDTO);
            resource.add(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).withSelfRel());
            return resource;
        } catch(IOException ex ){
            log.error("IO Exception "+ex.getMessage(),ex);
        }
        return null;
    }


    private List<EFOKeyLabel> transformRiskAllele(List<String> riskAlleles) {
        if(!riskAlleles.isEmpty()) {
          String riskAllele =  riskAlleles.get(0).replaceAll(" -","-");
          String separator = " x ";
           if( riskAllele.contains(";")){
                separator = ";";
            }
           String[] alleles = riskAllele.split(separator);
          return  Arrays.asList(alleles).stream().map((allele) -> {
                if (allele.matches("\\w+-.+")) {
                    int lastIndex = allele.lastIndexOf("-");
                    String allele_rsId = allele.substring(0, lastIndex).trim().replace(" ", "");
                    String allele_label = allele.substring(lastIndex + 1, allele.length()).trim();
                    String alleleDisplayLabel = allele_rsId + "-" + allele_label;
                    return new EFOKeyLabel(allele_rsId, alleleDisplayLabel);
                }
                return null;
            }).collect(Collectors.toList());
        }
        return null;
    }

    private String getRiskAllelleSep(List<String> riskAlleles) {
        String separator = "";
        if (!riskAlleles.isEmpty()) {
            String riskAllele = riskAlleles.get(0).replaceAll(" -", "-");
             separator = " x ";
            if (riskAllele.contains(";")) {
                separator = ";";
            }
        }
        return separator;
    }

    private String tranformPValueAnnotation(List<String> qualifier) {
        if(!qualifier.isEmpty()) {
           String qf = qualifier.get(0);
           if(qf.matches(".+"))
            return qf;
           else
               return null;
        }
        return null;
    }

    private String transformOrValue(Float orValue ,String orDescription){
       return  Optional.ofNullable(orDescription).map(orDesc -> String.valueOf(orValue) + " " + orDescription)
               .orElse(String.valueOf(orValue));
    }

    private String transformBeta(Float beta, String betaUnit, String betaDirection) {
        StringBuilder finalBeta = new StringBuilder();
        finalBeta.append(beta);
        if(!(String.valueOf(beta)).isEmpty()) {
            if(betaUnit != null && !betaUnit.isEmpty()) {
                finalBeta.append(" ");
                finalBeta.append(betaUnit);
            }
            if(betaDirection != null && !betaDirection.isEmpty()) {
                finalBeta.append(" ");
                finalBeta.append(betaDirection);
            }
        }
        return finalBeta.toString();
    }

    private List<String> transformMappedGenes(List<String> ensemblGenes) {
        if (!ensemblGenes.isEmpty()) {

            if (ensemblGenes.size() == 1) {
                String ensemblGene = ensemblGenes.get(0);
                if (ensemblGene.contains(" x ")) {
                  return  Arrays.asList(ensemblGene.split(" x ")).stream().
                            flatMap((genes) -> Arrays.asList(genes.split(" - "))
                                    .stream())
                            .collect(Collectors.toList());
                }
                if (ensemblGene.contains("; ")) {
                    return Arrays.asList(ensemblGene.split("; "));
                }
                return Collections.singletonList(ensemblGene);
            } else {
                return ensemblGenes;
            }
        }

        return null;
    }

    private List<String> transformPositionLinks(List<String> positionLinks) {
        if(!positionLinks.isEmpty()){
          List<String> genomicCoordinates =   positionLinks.stream().map((posLink) -> {
                String[] positions = posLink.split("\\|");
                String parsedPosition = "";
                String chrom = positions[0];
                String bpLocation = positions[1];
                if (chrom.length() < 3) {
                     parsedPosition = chrom + ":"+bpLocation;
                }
                return parsedPosition;
            }).collect(Collectors.toList());

          return genomicCoordinates.stream().filter(coordinate -> !coordinate.isEmpty())
                  .collect(Collectors.toList());
        }
        else{
            return null;
        }
    }

}


