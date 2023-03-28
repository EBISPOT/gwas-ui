package uk.ac.ebi.spot.goci.refactoring.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.EFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchAssociationDTO;
import uk.ac.ebi.spot.goci.refactoring.model.SearchEFOTraitDTO;

import java.util.List;

public interface SolrSearchEFOTraitsService {

Page<EFOTraitDoc> searchEFOTraits(SearchEFOTraitDTO searchEFOTraitDTO, String query, Pageable pageable);

List<EFOTraitDoc> createEFOTraitData(List<AssociationDoc> associationDocs, String rsId, SearchEFOTraitDTO searchEFOTraitDTO);


}
