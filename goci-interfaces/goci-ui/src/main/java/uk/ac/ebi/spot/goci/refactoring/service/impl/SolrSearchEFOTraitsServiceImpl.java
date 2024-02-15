package uk.ac.ebi.spot.goci.refactoring.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;
import uk.ac.ebi.spot.goci.refactoring.model.EFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchEFOTraitDTO;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchEFOTraitsService;
import uk.ac.ebi.spot.goci.refactoring.util.SolrEntityTransformerUtility;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SolrSearchEFOTraitsServiceImpl implements SolrSearchEFOTraitsService {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchEFOTraitsService.class);
    @Autowired
    RestInteractionService restInteractionService;
    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    SolrEntityTransformerUtility solrEntityTransformerUtility;

    ObjectMapper objectMapper = new ObjectMapper();

    public Page<EFOTraitDoc> searchEFOTraits(SearchEFOTraitDTO searchEFOTraitDTO, String query, Pageable pageable) {
      //String query =  String.format("rsId:\"%s\" OR association_rsId :\"%s\"", rsId, rsId);
        String uri = buildURIComponent(pageable.getPageSize(), pageable.getPageNumber() + 1, query);
        SolrData data = restInteractionService.callSolrAPI(uri);
        if( data != null &&  data.getResponse() != null ) {
            log.info("Response data Count"+data.getResponse().getNumFound());
            List<? > docs =  data.getResponse().getDocs();
            Sort sort = pageable.getSort();
            int start = pageable.getPageNumber() * pageable.getPageSize();
            int end = start + pageable.getPageSize();
            log.info("The start index is ->"+start);
            List<AssociationDoc> associationDocs = objectMapper.convertValue(docs, new TypeReference<List<AssociationDoc>>(){{}});
            List<EFOTraitDoc> efoTraitsDocs = createEFOTraitData(associationDocs, query, searchEFOTraitDTO);
            Sort.Order orderAsscn  = null;
            if(sort != null) {
                orderAsscn = sort.getOrderFor("associationCount");
                if(orderAsscn.isAscending()) {
                    efoTraitsDocs.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount));
                } else {
                    efoTraitsDocs.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount).reversed());
                }
            }else {
                efoTraitsDocs.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount).reversed());
            }
            log.info("The size of  efoTraitsDocs is ->"+efoTraitsDocs.size());
            if(end > efoTraitsDocs.size()) {
                end = efoTraitsDocs.size();
            }
            log.info("The end index is ->"+end);
            Page<EFOTraitDoc> page = new PageImpl<>(efoTraitsDocs.subList(start, end), pageable, efoTraitsDocs.size());
            return page;
        } else {
            return null;
        }
    }

    private String buildURIComponent( int maxResults, int page, String query) {
        String fatSolrUri = restInteractionService.getFatSolrUri();
        UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(fatSolrUri)
                .queryParams(buildQueryParams( maxResults, page, query))
                .build();
        return uriComponents.toUriString();
    }

    private MultiValueMap<String, String> buildQueryParams(int maxResults, int page, String query) {
        MultiValueMap<String, String> paramsMap = new LinkedMultiValueMap<>();
        paramsMap.add("wt","json");
        paramsMap.add("rows",String.valueOf(Integer.MAX_VALUE));
        int start = (page - 1) * maxResults;
        //paramsMap.add("start", String.valueOf(start));
        String fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_ASSOCIATION;

        String fl = SearchUIConstants.EFO_FIELDS;
        //String fl = "*";
        paramsMap.add("q",query );
        paramsMap.add("fq",fq );
        paramsMap.add("fl",fl );

        return paramsMap;
    }

   public List<EFOTraitDoc> createEFOTraitData(List<AssociationDoc> associationDocs, String rsId, SearchEFOTraitDTO searchEFOTraitDTO) {
       Map<String, EFOTraitDoc> efoMap = new HashMap<>();
       associationDocs.stream().forEach(associationDoc -> {
           EFOTraitDoc efoTraitDoc = null;
           String efoDocId = Optional.ofNullable(associationDoc.getShortForms()).map(s -> s.stream().collect(Collectors.joining("_")))
                   .orElse(Optional.ofNullable(associationDoc.getMappedUri()).map(uris -> uris.stream().map(uri ->
                           solrEntityTransformerUtility.retreiveEFOFromUri(uri)).collect(Collectors.joining("_"))).orElse(null));
           //log.info("The EFO Doc Id is "+efoDocId);
           String reportedTrait = Optional.ofNullable(associationDoc.getTraitNames()).filter(traits ->
                   !traits.isEmpty()).map(traits -> traits.get(0)).orElse(null);
           Integer rsIdLen = Optional.ofNullable(associationDoc.getRsIds()).filter(rsids -> !rsids.isEmpty()).map(rsIds -> rsIds.size()).orElse(0);
           if (efoMap.get(efoDocId) != null) {
               if (reportedTrait != null) {
                   List<String> reportedtraits = efoMap.get(efoDocId).getReportedTrait();
                   if (!reportedtraits.contains(reportedTrait)) {
                       reportedtraits.add(reportedTrait);
                   }
               }
               Integer numOfAsscns = efoMap.get(efoDocId).getAssociationCount();
               numOfAsscns += rsIdLen;
               efoMap.get(efoDocId).setAssociationCount(numOfAsscns);

           } else {
               List<EFOKeyLabel> efoKeyLabels = new ArrayList<>();
               if (associationDoc.getMappedLabel() != null) {
                   for (int i = 0; i < associationDoc.getMappedLabel().size(); i++) {
                       EFOKeyLabel efoKeyLabel = new EFOKeyLabel(solrEntityTransformerUtility.retreiveEFOFromUri
                               (associationDoc.getMappedUri().get(i)), associationDoc.getMappedLabel().get(i));
                       efoKeyLabels.add(efoKeyLabel);
                   }
                   efoKeyLabels.sort(Comparator.comparing(EFOKeyLabel::getLabel));
               }
               List<String> reportedTraitList = new ArrayList<>();
               reportedTraitList.add(reportedTrait);
               efoTraitDoc = new EFOTraitDoc(efoKeyLabels, reportedTraitList, rsIdLen);
               efoMap.put(efoDocId, efoTraitDoc);
           }
       });
       return buildEFOTraitsList(efoMap, searchEFOTraitDTO);
    }

   public List<EFOTraitDoc> buildEFOTraitsList(Map<String, EFOTraitDoc> traitsMap, SearchEFOTraitDTO searchEFOTraitDTO) {
       List<EFOTraitDoc> efoTraitDocList = new ArrayList<>();
       traitsMap.forEach((key, value) -> efoTraitDocList.add(value));
       if(searchEFOTraitDTO != null ){
           return  filterEFOTraits(efoTraitDocList, searchEFOTraitDTO);
       }
       //efoTraitDocList.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount));
       return efoTraitDocList;
   }

   public List<EFOTraitDoc> filterEFOTraits(List<EFOTraitDoc> efoTraitDocs, SearchEFOTraitDTO searchEFOTraitDTO) {
       if (searchEFOTraitDTO != null) {
           String efoTrait = searchEFOTraitDTO.getEfoTrait();
           String reportedTrait = searchEFOTraitDTO.getReportedTrait();
           if (efoTrait != null && reportedTrait != null) {
               List<EFOTraitDoc> efoTraitDocList = efoTraitDocs.stream().filter(efoTraitDoc ->
                   findMatchingEFO(efoTraitDoc, efoTrait) &&
                           findMatchingReportedTraits(efoTraitDoc, reportedTrait)
               ).collect(Collectors.toList());
               //efoTraitDocList.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount).reversed());
               return efoTraitDocList;
           }
           if (efoTrait != null) {
               List<EFOTraitDoc> efoTraitDocList = efoTraitDocs.stream().filter(efoTraitDoc ->
                       findMatchingEFO(efoTraitDoc, efoTrait)
               ).collect(Collectors.toList());
               //efoTraitDocList.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount).reversed());
               return efoTraitDocList;
           }
           if (reportedTrait != null) {
               List<EFOTraitDoc> efoTraitDocList = efoTraitDocs.stream().filter(efoTraitDoc ->
                   findMatchingReportedTraits(efoTraitDoc, reportedTrait)
               ).collect(Collectors.toList());
               //efoTraitDocList.sort(Comparator.comparingInt(EFOTraitDoc::getAssociationCount).reversed());
               return efoTraitDocList;
           }
       }
       return efoTraitDocs;
     }



    private Boolean findMatchingReportedTraits(EFOTraitDoc efoTraitDoc, String reportedTrait) {
        List<String> matchingLabels = efoTraitDoc.getReportedTrait()
                .stream()
                .filter(label -> label.toLowerCase().contains(reportedTrait.toLowerCase())).
                collect(Collectors.toList());
        if (!matchingLabels.isEmpty())
            return true;
        else
            return false;
    }


    private Boolean findMatchingEFO(EFOTraitDoc efoTraitDoc, String efo) {
    List<String> matchingLabels = efoTraitDoc.getEfoTraits()
            .stream()
            .map(efoKeyLabel -> efoKeyLabel.getLabel())
            .filter(label -> label.toLowerCase().contains(efo.toLowerCase())).
            collect(Collectors.toList());
    if (!matchingLabels.isEmpty())
        return true;
    else
        return false;
}
}
