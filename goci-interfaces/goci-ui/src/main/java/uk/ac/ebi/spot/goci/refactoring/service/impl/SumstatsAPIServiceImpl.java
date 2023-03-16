package uk.ac.ebi.spot.goci.refactoring.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.ac.ebi.spot.goci.refactoring.model.Links;
import uk.ac.ebi.spot.goci.refactoring.model.SSDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SumstatsAPIDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SumstatsResponseDoc;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.refactoring.service.SumstatsAPIService;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SumstatsAPIServiceImpl implements SumstatsAPIService {

    @Autowired
    RestInteractionService restInteractionService;

    @Override
    public Map<String, String> getSumstatsMap(String uri) {
      SumstatsAPIDoc sumstatsAPIDoc = restInteractionService.callSSAPI(uri);
      Map<String, String> ssMap = null;
      if(sumstatsAPIDoc != null) {
           ssMap = retreiveSSMap(sumstatsAPIDoc);
      }
        return ssMap;
    }

    private Map<String, String> retreiveSSMap(SumstatsAPIDoc sumstatsAPIDoc) {
       SumstatsResponseDoc sumstatsResponseDoc = sumstatsAPIDoc.getSumstatsResponseDoc();

       return Optional.ofNullable(sumstatsResponseDoc.getStudies())
                .map(ssDocs -> ssDocs.stream()
                        .flatMap(ssDoc -> ssDoc.stream())
                        .collect(Collectors.toList())).orElse(null)
                        .stream()
                        .collect(Collectors.toMap(SSDoc::getAccession, SSDoc::getAccession,
                                (existing,replacement) -> existing));

    }


}
