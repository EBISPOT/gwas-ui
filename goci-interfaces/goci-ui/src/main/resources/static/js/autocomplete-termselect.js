/**
 * Created by dwelter on 04/09/15.
 */
$(document).ready(function() {

    $("input[data-widget='select']").each(function() {

        //var ontology =   $(this).data("gwasontology") ? $(this).data("gwasontology") : '';
        // Please use contextPath for ajax call!
        $(this).devbridgeAutocomplete({
                                          serviceUrl: gwasProperties.contextPath + 'api/select',
                                          minChars: 3,
                                          // maxHeight: 500,
                                          // limit: 100,
                                          // lookupLimit: 100,
                                          dataType: 'json',
                                          paramName: 'q',
                                          //params: {ontology : ontology},
                                          onSelect: function(suggestion) {
                                              //var type = getUrlType(suggestion.data.type);
                                              var encoded = encodeURIComponent(suggestion.data.iri);
                                              useAutoCompleteInput();
                                              // doFilter();
                                          },
                                          transformResult: function(response) {
                                              return {
                                                  suggestions: $.map(response.response.docs, function(dataItem) {
                                                      var id = dataItem.id;
                                                      var label = dataItem.mappedTrait;

                                                      var synonym = "";
                                                      var cantHighlight = true;
                                                      if (response.highlighting[id].label_autosuggest != undefined) {
                                                          label = response.highlighting[id].label_autosuggest[0];
                                                          cantHighlight = false;
                                                      }
                                                      else if (response.highlighting[id].label != undefined) {
                                                          label = response.highlighting[id].label[0];
                                                          cantHighlight = false;
                                                      }

                                                      if (cantHighlight) {
                                                          if (response.highlighting[id].synonym_autosuggest !=
                                                                  undefined) {
                                                              synonym =
                                                                      response.highlighting[id].synonym_autosuggest[0];
                                                          }
                                                          else if (response.highlighting[id].synonym != undefined) {
                                                              synonym = response.highlighting[id].synonym[0];
                                                          }
                                                      }

                                                      return {
                                                          value: dataItem.mappedTrait,
                                                          data: {iri: dataItem.mappedUri, label: label, synonym: synonym}
                                                      };
                                                  })
                                              };
                                          },
                                          formatResult: function(suggestion, currentValue) {
                                              var label = suggestion.data.label;
                                              var extra = "";
                                              if (suggestion.data.synonym != "") {
                                                  label = suggestion.data.synonym;

                                                  extra = "<div class='sub-text'>synonym for " + suggestion.value +
                                                          "</div>"
                                              }

                                              //return "<div><div class='ontology-source'>" + suggestion.data.prefix + "</div><div class='ontology-suggest''><div class='suggestion-value'>" + label + "</div>" + extra + "</div></div>";
                                              return "<div><div class='ontology-suggest''><div class='suggestion-value'>" +
                                                      label + "</div>" + extra + "</div></div>";

                                          }
                                      });

    });
});
