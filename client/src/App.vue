<template>
  <div id="app">
    <div id="header" class="container-fluid header-backing col-lg-10 offset-lg-1">
      <div class="row justify-content-end">
        <div class="col">
          <div class="row">
            <div class="col-xs-atuo">
              <img class="header-logo" alt="logo" src="./assets/logo.png">
            </div>
            <div class="col-md">
              <div class="row">
                <label class="main-title" v-html="titles.pageHeaderTitle"></label>
                  <label 
                    class="main-title-body" 
                    v-html="titles.pageHeaderBody"
                    id="title-body"
                  ></label>
                  <b-tooltip target="title-body" variant="light" custom-class="wideTooltip">{{ titles.pageHeaderDisclaimer }}</b-tooltip>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xs-1">
          <b-link v-b-toggle.collapse-1 class="help-button">Help</b-link>
        </div>
      </div>
      <b-collapse id="collapse-1" class="mt-2">
        <b-card>
          <p class="card-text" v-html="helpMessage"></p>
        </b-card>
      </b-collapse>
      
    </div>

    <div id="main-body" class="container-fluid main-backing col-lg-10 offset-lg-1">
    
      <div id="selectors" class="row pad-row">

        <div id="supplier" class="col-xl-5">
          <multiselect 
            id='supplierSelect'
            class='multi-select'
            v-model="supplier" 
            :placeholder="titles.supplierSelectDefault"
            :options="suppliers" 
            :searchable="true" 
            :close-on-select="true"
            :select-label="''"
            :deselect-label="''"
            @select='supplierSelect'
            @remove='supplierRemove'
          >Supplier</multiselect>
        </div>

        <div id="bottle-type-id" class="col-xl-7" v-show="!stockCodeSearch">
          <div class="row">

            <div id="bottle-type" class="col-xl-6">
              <multiselect 
                class='multi-select'
                v-model="bottleType"
                :placeholder="titles.bottleTypeSelectDefault"
                :options="bottleTypes" 
                :searchable="true" 
                :close-on-select="true"
                :select-label="''"
                :deselect-label="''"
                @select='bottleTypeSelect'
                @remove='bottleTypeRemove'
                :disabled="!supplier"
              >Bottle type</multiselect>
            </div>

            <div id="bottle-id" class="col-xl-6">
              <multiselect 
                class='multi-select'
                v-model="bottleId"
                :placeholder="titles.bottleSelectDefault" 
                :options="bottles" 
                :searchable="true" 
                :close-on-select="true"
                :select-label="''"
                :deselect-label="''"
                @select='bottleSelect'
                @remove='bottleRemove' 
                :disabled="!bottleType"
              >Bottle</multiselect>
            </div>

          </div>
        </div>

        <div id="bottle-type-id" class="col-xl-7" v-show="stockCodeSearch">
          <multiselect 
            class='multi-select'
            v-model="stockCodeDisplay"
            :placeholder="titles.stockSearchPrompt"
            :options="stockCodeOptions" 
            :searchable="true" 
            :close-on-select="true"
            :select-label="''"
            :deselect-label="''"
            :disabled="!supplier"
            @select='stockCodeSelect'
            @remove='stockCodeRemove'
          >Stock Code</multiselect>
        </div>

      </div>

      <div id="container-forms-preview" class="row pad-row">

        <div id="label-inputs" class="col-lg-5">

          <multiselect 
            class='multi-select'
            v-model="labelStatuses.selected" 
            placeholder="Select the labels you want"
            :close-on-select="false" 
            :options="validLabelOptions"
            :multiple="true"
            :max="4"
            :disabled="!bottleSpec"
            @select='addLabel'
            @remove='removeLabel'
          >Label choice</multiselect>

          <div id="forms-labels" class="row" v-show="!medalMode || globalPositions.activeLabels.length == 0 || labelStatuses.filled.length != globalPositions.activeLabels.length">

            <div id="front-labels" class="col-sm-6">

              <label class="form-header" v-if="bottleSpec" v-html="titles.frontLabel"></label>
              <label class="form-header dissabled-text" v-else v-html="titles.frontLabel"></label>

              <measurements-form
                v-for="n in labelStatuses.front.count"
                :key="'F' + n"
                :id="'frontF' + n"
                ref=n
                side="front"
                :labelId="'F' + n"
                :bottleSpec="bottleSpec"
                :globalPositions="globalPositions"
                v-show='labelStatuses.front.enabled'
                @invalid="emmittedInvalidLabel"
                @valid="emmittedValidLabel"
                @warning="emmitedWarningCatch"
              >Front labels</measurements-form>

              <div 
                class="alert alert-warning" 
                role="alert" 
                id='frontDissabledWarning' 
                v-if="!labelStatuses.front.enabled"
              >{{ labelStatuses.front.dissableMessage }}</div>

            </div>

            <div id="back-labels" class="col-sm-6">

              <label class="form-header" v-if="bottleSpec" v-html="titles.backLabel"></label>
              <label class="form-header dissabled-text" v-else v-html="titles.backLabel"></label>
                            
              <measurements-form
                v-for="n in labelStatuses.back.count"
                :key="'B' + n"
                :id="'backB' + n"
                ref=n
                side="back"
                :labelId="'B' + n"
                :bottleSpec="bottleSpec"
                :globalPositions="globalPositions"
                v-show='labelStatuses.back.enabled'
                @invalid="emmittedInvalidLabel"
                @valid="emmittedValidLabel"
                @warning="emmitedWarningCatch"
              >Back labels</measurements-form>
                            
              <div 
                class="alert alert-warning invalidWarning" 
                role="alert" 
                id='backDissabledWarning' 
                v-if="!labelStatuses.back.enabled"
                v-html="labelStatuses.back.dissableMessage"
              ></div>

            </div>

            <button 
              class='medal-button' 
              v-if='!help && !medalMode' 
              v-on:click="medalMode = !medalMode"
              :disabled="labelStatuses.filled.length < globalPositions.activeLabels.length || globalPositions.activeLabels.length == 0 || globalPositions.activeMedals == 0"
              v-html="titles.medalButton"
            ></button>

            <button 
              class="clear-button" 
              v-if='globalPositions.activeLabels.length > 0' 
              v-on:click="clearForm()" 
              :disabled="globalPositions.activeLabels.length == 0"
              v-html="titles.clearButton"
            ></button>
            <button 
              class="clear-button dissabled-clear" 
              v-else
              v-on:click="clearForm()" 
              :disabled="globalPositions.activeLabels.length == 0"
              v-html="titles.clearButton"
            ></button>

          </div>

          <div id="forms-medal" class="row" v-show="medalMode && globalPositions.activeLabels.length != 0 && labelStatuses.filled.length == globalPositions.activeLabels.length">
            <label class="pre-formatted medal-help" v-html="medalPlacementHelp"></label>

            <measurements-form-medals
              v-for="n in labelStatuses.medal.count"
              :key="'M' + n"
              :id="'medalM' + n"
              ref=n
              side="medal"
              :labelId="'M' + n"
              :bottleSpec="bottleSpec"
              :globalPositions="globalPositions"
              v-show='labelStatuses.medal.enabled'
              @invalid="emmittedInvalidLabel"
              @valid="emmittedValidLabel"
            >Medals</measurements-form-medals>

            <button 
              class='medal-button' 
              v-if='!help && medalMode' 
              v-on:click="medalMode = !medalMode"
              v-html="titles.labelButton"
            ></button>

            <button 
              class="clear-button" 
              v-if='globalPositions.activeLabels.length > 0' 
              v-on:click="clearForm()" 
              :disabled="globalPositions.activeLabels.length == 0"
              v-html="titles.clearButton"
            ></button>
            <button 
              class="clear-button dissabled-clear" 
              v-else
              v-on:click="clearForm()" 
              :disabled="globalPositions.activeLabels.length == 0"
              v-html="titles.clearButton"
            ></button>

          </div>

        </div>

        <div id="previews-col" class="col-lg-7">
          <br><br>
          <label class="preview-header center" v-if="!bottleSpec" v-html="selectHelpMessage"></label>
          <div id="previews" class="row" v-show="bottleSpec">

            <div id="front-preview" class="col-lg-6 center">

              <div id="preview-header-front" class="row center">
                <div class="col-lg-12">
                  <label class='preview-header center' v-html="titles.frontLabel"></label>
                </div>
              </div>

              <div id="preview-body-front" class="row">
                <div class="col-lg-12">

                  <div class="layer-2 labelPreview" id='frontLabelPreview1'></div>
                  <div class="layer-2 labelPreview" id='frontLabelPreviewOverflowLeft1'></div>
                  <div class="layer-2 labelPreview" id='frontLabelPreviewOverflowRight1'></div>

                  <div class="layer-3 labelPreview" id='frontLabelPreview2'></div>
                  <div class="layer-3 labelPreview" id='frontLabelPreviewOverflowLeft2'></div>
                  <div class="layer-3 labelPreview" id='frontLabelPreviewOverflowRight2'></div>

                  <transition name="slide-fade">
                    <img v-show=" bottleSpec" class="image layer-1" alt="bottle sihouette" :src="bottleImgUrl">
                  </transition>

                </div>
              </div>

            </div>

            <div id="back-preview" class="col-lg-6">

              <div id="preview-header-back" class="row">
                <div class="col-lg-12">
                  <label class='preview-header' v-if="bottleSpec" v-html="titles.backLabel"></label>
                </div>
              </div>

              <div id="preview-body-back" class="row">
                <div class="col-lg-12">

                  <div class="layer-2 labelPreview" id='backLabelPreview1'></div>
                  <div class="layer-2 labelPreview" id='backLabelPreviewOverflowLeft1'></div>
                  <div class="layer-2 labelPreview" id='backLabelPreviewOverflowRight1'></div>

                  <div class="layer-3 labelPreview" id='backLabelPreview2'></div>
                  <div class="layer-3 labelPreview" id='backLabelPreviewOverflowLeft2'></div>
                  <div class="layer-3 labelPreview" id='backLabelPreviewOverflowRight2'></div>

                  <transition name="slide-fade">
                    <img v-show=" bottleSpec" class="image layer-1" alt="bottle sihouette" :src="bottleImgUrl">
                  </transition>

                </div>
              </div>

            </div>

          </div>

          <label v-if="bottleType && bottleSpec" class="disclaimer" v-html=bottlePreviewDisclaimer></label>
          <br>
          <label v-if="bottleType && bottleSpec" class="disclaimer" v-html=labelGuideDisclaimer></label>

          <div class='layer-10'>
            <div class="alert alert-danger p-5 font-weight-bold invalid-alert" role="alert" id='invalidWarning' v-show="showInvalid" v-html="overallWarning"></div>
          </div>

        </div>

      </div>

    </div>

    <div>
      <b-modal 
        ref="orangeZoneWarning" 
        centered
        :header-bg-variant="'warning'"
        size="md"
        >
        <template #default class="rounded">
          <label class="modal-body" v-html="orangeZoneMessage"></label>
        </template>
        <template #modal-header="{  }">
          <!-- Emulate built in modal header close button action -->
          <div class="container-fluid">
            <p class="modal-title" v-html="titles.popupTitle"></p>
          </div>
        </template>
      </b-modal>
    </div>

  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  import measurementsForm from './components/measurementsForm.vue';
  import measurementsFormMedals from './components/measurementsFormMedals.vue';

  import dataImport from './assets/data.json';
  import CONSTANTS from './assets/CONSTANTS.json';

  import * as silhouettes from './assets/bottle_silhouette';


  export default {
    name: 'App',
    components: {Multiselect, measurementsForm, measurementsFormMedals},
    data () {
        return {
          data: [],
          suppliers: [],
          supplierBottles: [],
          bottleTypes: [],
          bottles: [],
          supplier: null,
          bottleType: null,
          bottleId: null,
          bottleSpec: null,
          showInvalid: false,
          overallWarning: '',
          warned: false,
          globalPositions: {
            'latest': 
              {
                'id': null,
                'type': null,
                'side': null
              },
            'front': 
              {
                'maxWidth': null
              },
            'back': 
              {
                'maxWidth': null
              },
            'medal': {},
            'activeLabels': [],
            'activeMedals': []
          },
          labelStatuses: {
            'hasWrap': false,
            'selected': [],
            'filled': [],
            'front': {
              'enabled': true,
              'dissableMessage': '',
              'count': 0
            },
            'back': {
              'enabled': true,
              'dissableMessage': '',
              'count': 0
            },
            'medal': {
              'enabled': true,
              'dissableMessage': '',
              'count': 0
            }
          },
          help: false,
          helpMessage: "",
          bottlePreviewDisclaimer: "",
          validLabelOptions: [],
          selectHelpMessage: '',

          medalMode: false,  // toggle between labels and medals using button
          medalPlacementHelp: '',
          orangeZoneMessage: '',
          labelGuideDisclaimer: '',

          titles: {},

          bottleImgUrl: '',

          stockCodeSearch: false,
          stockCodeOptions: [],
          stockCodeKey: {},
          stockCodeDisplay: null,
          stockCode: ''
        }
    },

    mounted() {
        this.loadData();

        this.titles = CONSTANTS.titles;

        const helpLink = `<a href=${CONSTANTS.help.helpLink} target="_blank" class='alert-link'>${CONSTANTS.help.helpLinkDisplay}</a>`;
        const guideLinkHere = `<a href=${CONSTANTS.help.userGuideLink} target="_blank" class='alert-link'>${CONSTANTS.help.userGuideLinkDisplay}</a>`;
        const guideLinkGuide = `<a href=${CONSTANTS.help.userGuideLink} target="_blank" class='alert-link'>${CONSTANTS.help.guideDisclaimerDisplay}</a>`;
        this.helpMessage = CONSTANTS.help.helpMessage.replace("[help link here]", helpLink).replace("[user guide link here]", guideLinkHere);
        this.labelGuideDisclaimer = CONSTANTS.help.labelGuideDisclaimer.replace("[WW label guide link]", guideLinkGuide);

        this.overallWarning = CONSTANTS.warning.invalidWarning;
        this.bottlePreviewDisclaimer = CONSTANTS.help.bottlePreviewDisclaimer;
        this.selectHelpMessage = CONSTANTS.help.selectHelpMessage;
        this.orangeZoneMessage = CONSTANTS.help.orangeZoneMessage;

        this.validLabelOptions = [CONSTANTS.labelNames.F1, CONSTANTS.labelNames.B1];
    },

    methods: {
      
      // Load data into instance and sets supplier list for multiselect
      loadData() {
          this.data = dataImport;

          this.suppliers = Object.keys(this.data);
          this.suppliers.push(CONSTANTS.titles.stockSearchOption)
      },

      // When the supplier is selected, sets the list of options for the bottle types and clears all flieds that require supplier
      supplierSelect(supplierSelection) {
        if (supplierSelection != CONSTANTS.titles.stockSearchOption) {
          this.stockCodeSearch = false;
          this.bottleTypes = Object.keys(this.data[supplierSelection]);
          this.bottleTypes = this.targetSort(this.bottleTypes, CONSTANTS.bottleSortTemplate);
        } else {
          this.stockCodeSearch = true;
          var bottleData;
          var stockCodeStr;
          var codeData;
          for (var supplier in this.data) {
            for (var bottleType in this.data[supplier]) {
              for (var bottle in this.data[supplier][bottleType]) {
                bottleData = this.data[supplier][bottleType][bottle];
                for (var stockCode in bottleData.stockCodes) {
                  codeData = bottleData.stockCodes[stockCode];
                  stockCodeStr = `${codeData.code} - ${codeData.name} - Mould ${bottle}`;
                  this.stockCodeOptions.push(stockCodeStr);
                  this.stockCodeKey[stockCodeStr] = {"id":bottle, "type":bottleType, "supplier":supplier};
                }
              }
            }
          }
          this.stockCodeOptions.sort();
        }

        this.bottleType = null;
        this.bottleId = null;
        this.bottleSpec = null;
      },

      // Clears all fields that require supplier when the supplier is removed
      supplierRemove() {
        this.bottleType = null;
        this.bottleId = null;
        this.bottleSpec = null;
      },

      stockCodeSelect(stockCodeSelection) {
        this.stockCode = stockCodeSelection.split(' - ')[0];
        this.bottleId = this.stockCodeKey[stockCodeSelection].id;
        this.bottleType = this.stockCodeKey[stockCodeSelection].type;
        const supplier = this.stockCodeKey[stockCodeSelection].supplier
        this.bottleSpec = this.data[supplier][this.bottleType][this.bottleId];

        this.specPrep();
      },

      stockCodeRemove() {
        this.stockCode = null;
        this.bottleId = null;
        this.bottleType = null;
        this.bottleSpec = null;
      },

      // When bottle type is selected and clears all flieds that require bottleType
      // Sets list of bottle ids and adds bottle name along side each bottle id (in form ("id - name"))
      bottleTypeSelect(bottleTypeSelection) {
        this.bottles = Object.keys(this.data[this.supplier][bottleTypeSelection]);
        var sortKey = {};
        var code;
        for (var x in this.bottles) {
          code = this.bottles[x];
          this.bottles[x] += " - " + this.data[this.supplier][bottleTypeSelection][code].name;
          sortKey[this.bottles[x]] = this.data[this.supplier][bottleTypeSelection][code].order;
        }
        this.bottles.sort((a, b) => (sortKey[a] > sortKey[b]) ? 1 : -1);

        this.bottleId = null;
        this.bottleSpec = null;
      },

      // Clears all fields that require bottleType when the bottleType is removed
      bottleTypeRemove() {
        this.bottleId = null;
        this.bottleSpec = null;
      },

      // When the bottle is selected, sets the bottle spec to the spec for that specific bottle and updates displays for each input
      // Calculates bottle circumference and adds it to bottle spec
      // All numeric fields are rounded. (mins are rounded down and max is rounded up)
      bottleSelect(bottleIdSelection) {
        const bottleId = bottleIdSelection.split(" ")[0]; // Seperate name from the id and take the ID only
        this.bottleSpec = this.data[this.supplier][this.bottleType][bottleId];
        this.specPrep();
      },

      specPrep() {
        this.bottleImgUrl = silhouettes[CONSTANTS.bottleCodes[this.bottleType] + "Image"];
        // All spec variables are rounded as fractional mm are not improtatant to this context
        // Rounding is always done in a direction to tighten constraints
        this.bottleSpec.circumference = Math.floor(this.bottleSpec.diameter * Math.PI);

        this.bottleSpec.warning.minHeightOffset = Math.ceil(this.bottleSpec.warning.minHeightOffset);
        this.bottleSpec.warning.maxHeight = Math.floor(this.bottleSpec.warning.maxHeight);
        this.bottleSpec.warning.maxWidth = Math.floor(this.bottleSpec.warning.maxWidth);
        this.bottleSpec.warning.VpointX = Math.floor(this.bottleSpec.warning.VpointX);
        this.bottleSpec.warning.UpointY = Math.floor(this.bottleSpec.warning.UpointY);

        this.bottleSpec.recommended.minHeightOffset = Math.ceil(this.bottleSpec.recommended.minHeightOffset);
        this.bottleSpec.recommended.maxHeight = Math.floor(this.bottleSpec.recommended.maxHeight);
        this.bottleSpec.recommended.maxWidth = Math.floor(this.bottleSpec.recommended.maxWidth);

        const optimumZone = Math.round(CONSTANTS.data.optimumMedalZoneScale * this.bottleSpec.circumference / 2);
        this.medalPlacementHelp = CONSTANTS.help.medalPlacementHelp.replace("[measure here]", optimumZone);
      },

      // Clears bottleSpec when bottleId is removed
      bottleRemove() {
        this.bottleSpec = null;
      },

      // Dissables the back label if front label max width would define it as a wrap around
      checkWrapAround() {

        const wrapAroundBoundry = CONSTANTS.data.warpAroundDef * this.bottleSpec.circumference;
        if (this.globalPositions.front.maxWidth != null && this.globalPositions.front.maxWidth > wrapAroundBoundry) {
          this.labelStatuses.back.enabled = false;
          this.labelStatuses.back.dissableMessage = CONSTANTS.help.wrapAroundMessage;
          this.labelStatuses.hasWrap = true;
          if (this.globalPositions.activeLabels.includes('F2')) {
            document.getElementById('frontF2').classList.add("hidden"); // This is done as it is simpler than trying to putting a v-show in a v-for that doesn't cover all components in the v-for
          }
        } else {
          this.labelStatuses.back.enabled = true;
          this.labelStatuses.back.dissableMessage = '';
          this.labelStatuses.hasWrap = false;
          if (this.globalPositions.activeLabels.includes('F2')) {
            document.getElementById('frontF2').classList.remove("hidden");  // This is done as it is simpler than trying to putting a v-show in a v-for that doesn't cover all components in the v-for
          }
        }
      },

      targetSort(list, target) {
          var ordering = {};
          for (var i=0; i<target.length; i++)
              ordering[target[i]] = i;

          list = list.sort( function(a, b) {
              return (ordering[a] - ordering[b]) || a.localeCompare(b);
          });
        return list;
      },

      // When label selected in multi select
      // Updates label counts
      // Updates validLabelOptions
      // Adds label to active labels
      // Updates globalPositions.latest to be a global to force updates in child measurement forms
      // Label: selection from the multi select
      addLabel(label) {
        //update count: type, global

        if (label.toLowerCase().includes(CONSTANTS.labelNames.F1.toLowerCase())) {
          this.labelStatuses.front.count += 1;
        } else if (label.toLowerCase().includes(CONSTANTS.labelNames.B1.toLowerCase())) {
          this.labelStatuses.back.count += 1;
        } else if (label.toLowerCase().includes(CONSTANTS.labelNames.M1.toLowerCase())) {
          this.labelStatuses.medal.count += 1;
        }

        //add dependent labels
        if (label == CONSTANTS.labelNames.F1) {
          this.validLabelOptions.push(CONSTANTS.labelNames.F2);
          this.validLabelOptions.push(CONSTANTS.labelNames.M1);

        } else if (label == CONSTANTS.labelNames.B1) {
          this.validLabelOptions.push(CONSTANTS.labelNames.B2);

        } else if (label == CONSTANTS.labelNames.M1) {
          this.validLabelOptions.push(CONSTANTS.labelNames.M2);
        }

        this.validLabelOptions = this.targetSort(this.validLabelOptions, CONSTANTS.labelSortTemplate);


        switch (label) {
          case CONSTANTS.labelNames.F1:
            this.globalPositions.activeLabels.push('F1');
            break;
          case CONSTANTS.labelNames.B1:
            this.globalPositions.activeLabels.push('B1');
            break;
          case CONSTANTS.labelNames.F2:
            this.globalPositions.activeLabels.push('F2');
            break;
          case CONSTANTS.labelNames.B2:
            this.globalPositions.activeLabels.push('B2');
            break;
          case CONSTANTS.labelNames.M1:
            this.globalPositions.activeMedals.push('M1');
            break;
          case CONSTANTS.labelNames.M2:
            this.globalPositions.activeMedals.push('M2');
            break;
        }

        this.globalPositions.latest.id = 'global';
      },

      // Minor helper function, removes the given item from the array and returns the resultant array
      arrayRemove(array, item) {
        var index = array.indexOf(item);
        if (index > -1) {
          array.splice(index, 1);
        }
        return array;
      },

      // Removes label from globalPositions.activeLabels (/medals) and labelStatuses.filled (if not a medal)
      // Checks if medal mode should be dissabled
      // Clears label data from global positions
      // If deselect: deselects the item from the current label selections (used to deslect dependednts when their dependency is removed)
      // ID: id of the label
      // side: side the label is on {'front', 'back', 'medal'}
      // deselect: boolean tag denoting if the label needs to be removed from the currently selected labels
      cleanLabel(ID, side, deselect) {

        if (deselect) {
          this.labelStatuses.selected = this.arrayRemove(this.labelStatuses.selected, CONSTANTS.labelNames[ID]);
        }

        this.labelStatuses[side].count -= 1;
        if (side != 'medal') {
          this.globalPositions.activeLabels = this.arrayRemove(this.globalPositions.activeLabels, ID);
          this.labelStatuses.filled = this.arrayRemove(this.labelStatuses.filled, ID);
        } else {
          this.globalPositions.activeMedals = this.arrayRemove(this.globalPositions.activeMedals, ID);
        }

        this.medalMode &= this.globalPositions.activeMedals.length > 0;
        
        this.globalPositions[side][ID] = null;
      },

      // When label deslected in multi select
      // Removes dependent labels from thevalid options and from the active selections
      // Updates label counts
      // Nullifies the labels information in globalPositions
      // Updates max width valeus
      // Updates label preview
      // Updates global invalid
      // Label: multi select option that was removed
      removeLabel(label) {
        //medals logic stuff
        if (label == CONSTANTS.labelNames.F1) {
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.F2);
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.M1);
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.M2);

          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.F2)) {
            this.cleanLabel('F2', 'front', true);
          }
          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.M1)) {
            this.cleanLabel('M1', 'medal', true);
          }
          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.M2)) {
            this.cleanLabel('M2', 'medal', true);
          }
          
          this.cleanLabel('F1', 'front', false);

          this.updateMaxWidth('front');
        }

        if (label == CONSTANTS.labelNames.B1) {
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.B2);

          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.B2)) {
            this.cleanLabel('B2', 'back', true);
          }

          this.cleanLabel('B1', 'back', false);

          this.updateMaxWidth('back');
        }

        if (label == CONSTANTS.labelNames.M1) {
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.M2);

          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.M2)) {
            this.cleanLabel('M2', 'medal', true);
          }

          this.cleanLabel('M1', 'medal', false);
        }

        if (label == CONSTANTS.labelNames.M2) {
          this.cleanLabel('M2', 'medal', false);
        }

        if (label == CONSTANTS.labelNames.F2) {
          this.cleanLabel('F2', 'front', false);
          this.updateMaxWidth('front');
        }

        if (label == CONSTANTS.labelNames.B2) {
          this.cleanLabel('B2', 'back', false);
          this.updateMaxWidth('back');
        }

        this.globalPositions.latest.id = 'global';

        this.clearPreview();
        this.updatePreview();

        this.checkGlobalInvalid();
      },

      // Updates the maxWidth information for the given side when a label is updated and calls checkWrapAround()
      // Side: side of the bottle being updated
      updateMaxWidth(side) {

        var maxWidthValue = null;

        Object.keys(this.globalPositions[side]).forEach((element) => {
          if (element != 'maxWidth' && this.globalPositions[side][element] != null) {
            if (this.globalPositions[side][element].width > maxWidthValue) {
              maxWidthValue = this.globalPositions[side][element].width;
            }
          }
        });

        this.globalPositions[side].maxWidth = maxWidthValue;

        this.checkWrapAround();
      },

      // Run when clear all forms button is clicked
      // Resets warned (allows orange zone warning message to appear again), directly calls clearForm() on measurementForm componets through refs 
      //    - Refs call is used as this is an event and it is not sutable to change the child's state
      // Resets globalPositions and labelStatuses, then calls checkWrapAround() and checkGlobalInvalid() to clear and reset any errors
      clearForm() {
        console.log(this.bottleId, "||", this.bottleType, "||", this.bottleSpec);
        
        // Clear the orange zone warning as well? Just to be safe
        this.warned = false;

        if (this.globalPositions.activeLabels.includes('F2')) {
          document.getElementById('frontF2').classList.remove("hidden");  // This is done as it is simpler than trying to putting a v-show in a v-for that doesn't cover all components in the v-for
        }

        const activeLabels = this.globalPositions.activeLabels;
        const activeMedals = this.globalPositions.activeMedals;

        this.globalPositions = {
          'latest': 
            {
              'id': null,
              'type': null,
              'side': null
            },
          'front': 
            {
              'maxWidth': null
            },
          'back': 
            {
              'maxWidth': null
            },
          'medal': {},
          'activeLabels': activeLabels,
          'activeMedals': activeMedals
        },
        this.labelStatuses.front.enabled = true;
        this.labelStatuses.front.dissableMessage = '';
        this.labelStatuses.back.enabled = true;
        this.labelStatuses.back.dissableMessage = '';
        this.labelStatuses.filled = [];
        this.medalMode = false;
        
        this.checkWrapAround();

        this.checkGlobalInvalid();

        this.$refs.n.forEach(form => form.clearForm());

        this.clearPreview();

      },

      // Checks if the "global level" error/invalid warning box is needed
      checkGlobalInvalid() {
        var front = Object.keys(this.globalPositions.front).every((element)=> {
          if (element != 'maxWidth' && this.globalPositions.front[element] != null) {
            return this.globalPositions.front[element].valid;
          } else {
            return true;
          }
        });
        front |= !this.labelStatuses.front.enabled;
        var back = Object.keys(this.globalPositions.back).every((element)=> {
          if (element != 'maxWidth' && this.globalPositions.back[element] != null) {
            return this.globalPositions.back[element].valid;
          } else {
            return true;
          }
        });
        back |= !this.labelStatuses.back.enabled;
        // Medal support here
        this.showInvalid = !(front && back);
      },

      // Run when a warning (orange zone) is found in a measurement form
      // Updates globalPositions
      // Shows orange zone popup warning if not yet shown or a form has been reset
      emmitedWarningCatch(payload) {
        const {warning, labelId, side, type, form} = payload;

        this.globalPositions.latest = {'id': labelId, 'side':side, 'type':type};

        this.globalPositions[side][labelId] = form;   // Add/update new data to set

        this.labelStatuses.filled = this.arrayRemove(this.labelStatuses.filled, labelId);
        if (form.height != '' && form.width != '' && form.heightOffset != '') {
          if (labelId[1] == 2 && this.labelStatuses.filled.includes(labelId[0] + '1')) {
            this.labelStatuses.filled.push(labelId);
          } else if (labelId[1] == 1) {
            this.labelStatuses.filled.push(labelId);
          }
        }
        
        this.updateMaxWidth(side);

        this.checkGlobalInvalid();

        if (this.form != null) {
          this.updatePreview();
        }

        if (warning == 'orange zone') {
          if (!this.warned) {
            this.$refs['orangeZoneWarning'].show();
            this.warned = true;
          }
        }
      },

      // Runs when a invalid input is found in a measurement form
      // Updates globalPositions
      emmittedInvalidLabel(payload) {
        const {labelId, side, type} = payload;

        this.globalPositions.latest = {'id': labelId, 'side':side, 'type':type};
        if (this.globalPositions[side][labelId] == null) {
          this.globalPositions[side][labelId] = {};
        }

        this.globalPositions[side][labelId].valid = false

        if (side != 'medal') {
          this.labelStatuses.filled = this.arrayRemove(this.labelStatuses.filled, labelId);
        }

        this.checkGlobalInvalid();

        this.updatePreview();
      },

      // Runs when a valid input is found in a measurement form
      // UpdatesglobalPositions
      // Checks and updates (if needed) the maxWidth value for the given labels side
      emmittedValidLabel(payload) {

        const {form, labelId, side, type} = payload;

        this.globalPositions.latest = {'id': labelId, 'side':side, 'type':type};

        this.globalPositions[side][labelId] = form;   // Add/update new data to set

        if (side != 'medal') {
          this.labelStatuses.filled = this.arrayRemove(this.labelStatuses.filled, labelId);
          if (form.height != '' && form.width != '' && form.heightOffset != '') {
            if (labelId[1] == 2 && this.labelStatuses.filled.includes(labelId[0] + '1')) {
              this.labelStatuses.filled.push(labelId);
            } else if (labelId[1] == 1) {
              this.labelStatuses.filled.push(labelId);
            }
          }

          this.updateMaxWidth(side);
        }

        this.checkGlobalInvalid();
        if (form != null) {
          this.updatePreview();
        }
      },

      displaySide(side, labels) {
        const diamiter = this.bottleSpec.diameter;
        const radius = diamiter/2;

        var  label;
        for (var x in labels[side].main) {
          label = labels[side].main[x];
          if (label.theta <= Math.PI) {
            label['adjustedWidth'] = 2 * Math.sin(label.theta/2) * radius;
          } else {
            label['adjustedWidth'] = diamiter;
          }
          this.displayLabel(`${side}LabelPreview${x[1]}`, label);
        }

        for (var y in labels[side].overflow) {
          label = labels[side].overflow[y];
          if (label.theta > Math.PI) {
            label.theta -= Math.PI;
            label['adjustedWidth'] = radius - (Math.cos(label.theta/2) * radius);
          } else {
            label['adjustedWidth'] = 0;
          }
          this.displayLabel(`${side}LabelPreviewOverflowLeft${y[1]}`, label);
          this.displayLabel(`${side}LabelPreviewOverflowRight${y[1]}`, label);
        }
      },

      // Todo: multi label support

      // Fetches label measurements, calculates warped 2D width based on bottle size, displays label
      //    - Fetching and display functionality is handeled in helper functions
      updatePreview() {

        var labels = {'front': {'main': {}, 'overflow': {}}, 'back': {'main': {}, 'overflow': {}}};
        // loop for multi label

        for (var id of this.globalPositions.activeLabels) {
          if (id[0].toLowerCase() == 'f') {
            labels.front.main[id] = this.fetchDisplayMeasurements('front', id);
            labels.back.overflow[id] = this.fetchDisplayMeasurements('front', id);
          } else if (id[0].toLowerCase() == 'b') {
            labels.back.main[id] = this.fetchDisplayMeasurements('back', id);
            labels.front.overflow[id] = this.fetchDisplayMeasurements('back', id);
          }
        }

        this.displaySide('front', labels);
        this.displaySide('back', labels);
      },

      // Fetches height and height offset for the specified label and calculates the width of the label as an angle on the radius of the bottle
      // Default values are 0, if a height offset of 0 is found the label is hidden
      fetchDisplayMeasurements(side, labelId) {
        const radius = this.bottleSpec.diameter/2;
        
        var heightOffset = 0;
        var height = 0;
        var theta = 0;
        if (this.globalPositions[side][labelId] != null && this.globalPositions[side][labelId].valid) {
          heightOffset = this.globalPositions[side][labelId].heightOffset;
          height = this.globalPositions[side][labelId].height;
          theta = this.globalPositions[side][labelId].width / radius;
        }
        if (heightOffset == 0) {  
          height = 0;
          theta = 0;
        }
        if (this.labelStatuses.hasWrap && labelId != 'F1') {  // Medals support here
          height = 0;
          theta = 0;
        }

        return {'heightOffset':heightOffset, 'height':height, 'theta':theta};
      },

      // Clears all labels off label preview
      clearPreview() {
        const blank = {'height': 0, 'adjustedWidth': 0, 'heightOffset': 0}
        this.displayLabel('frontLabelPreview1', blank);
        this.displayLabel('frontLabelPreviewOverflowLeft1', blank);
        this.displayLabel('frontLabelPreviewOverflowRight1', blank);

        this.displayLabel('frontLabelPreview2', blank);
        this.displayLabel('frontLabelPreviewOverflowLeft2', blank);
        this.displayLabel('frontLabelPreviewOverflowRight2', blank);

        this.displayLabel('backLabelPreview1', blank);
        this.displayLabel('backLabelPreviewOverflowLeft1', blank);
        this.displayLabel('backLabelPreviewOverflowRight1', blank);

        this.displayLabel('backLabelPreview2', blank);
        this.displayLabel('backLabelPreviewOverflowLeft2', blank);
        this.displayLabel('backLabelPreviewOverflowRight2', blank);
      },

      // Sets demensions of the label preview on the bottle and places it in the right possition
      displayLabel(element, label) {

        const diamiter = this.bottleSpec.diameter;
        const fullHeight = CONSTANTS.bottleHeights[this.bottleType + "Height"];

        document.getElementById(element).style.height = `${(label.height/fullHeight)*100}%`;
        document.getElementById(element).style.width = `${(label.adjustedWidth/diamiter)*100*0.47}%`;
        document.getElementById(element).style.bottom = `${(label.heightOffset/fullHeight)*100}%`;

        if (element.includes('OverflowLeft')) {
          document.getElementById(element).style.left = `${26.5}%`;
        } else if (element.includes('OverflowRight')) {
          document.getElementById(element).style.left = `${100-26.5 - label.adjustedWidth/diamiter*100*0.47}%`;
        } else {
          document.getElementById(element).style.left = `${50 - ((label.adjustedWidth/diamiter)*100*0.47)/2}%`;
        }
      }
    }
  }

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

body{
  background-image: url('./assets/background blue.png');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  min-width: 350px;
}

.main-backing {
  margin-top: 40px;
  margin-bottom: 60px;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.93);
  padding: 40px;
}

.pad-row {
  padding-right: 15px;
}

.header-backing {
  margin-top: 20px;
  margin-bottom: 40px;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.93);
  padding: 20px;
}

.header-logo {
  width: 120%;
  max-width: 100px;
  float: left;
  margin-left: 20px;
  margin-right: 5px;
}

.main-title {
  font-size: 230%;
  text-align: left;
  margin-left: 10px;
  white-space: pre-wrap;
  float: left;
  font-weight: 700;
  color: rgba(65,65,65,1);
}

.main-title-body {
  font-size: 110%;
  margin-left: 10px;
  float: left;
  text-align: left;
  white-space: pre-wrap;
}

.main-title-disclaimer {
  font-size: 75%;
  float: left;
  text-align: left;
  white-space: pre-wrap;
}

#app {
  font-family: Arial;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top: 60px;
  padding-left: 2%;
}

.hidden {
    visibility: hidden !important;
}

.dissabled-text {
    opacity: 0.7;
}

.header {
  padding: 15px 10px 5px 10px;
  text-align: center;
  font-size: 20px;
  white-space: pre-wrap;
}

.form-header {
  padding: 15px 10px 5px 10px;
  text-align: center;
  font-weight: 600;
  font-size: 140%;
  white-space: pre-wrap;
}

.preview-header {
  padding: 15px 10px 5px 10px;
  font-weight: 600;
  font-size: 140%;
  white-space: pre-wrap;
}

.alert {
  white-space: pre-wrap;
}

.invalid-alert {
  width: 55%;
  font-size: 110%;
  float: center;
  left: 22.5%;
}

.disclaimer {
  padding: 10px;
  text-align: center;
  font-size: 15px;
  font-style: italic;
  white-space: pre-wrap;
}

.multi-select {
  margin: 5px;
}

.image {
  width: 50%;
}

.layer-1 {
  z-index: 0;
  position: relative;
}

.layer-2 {
  z-index: 1;
  position: absolute;
}

.layer-3 {
  z-index: 2;
  position: absolute;
}

.layer-4 {
  z-index: 6;
  position: absolute;
  border-radius: 50%;
}

.layer-10 {
  z-index: 10;
  position: absolute;
  top: 50%;
  left: 15%;
  width: 70%;
}

.help-button {
  float: right;
  text-align: center;
  padding: 8px 0px 20px 30px;
  font-size: 110%;
  white-space: pre-wrap;
  margin-right: 10px;
}

.right-col {
  margin-right: 5px;
}

.close {
  background: none;
  border: none;
  float: right;
}

.help {
  font-size: 95%;
  text-align: left;
  width: 100%;
  outline:none !important;
  outline-width: 0 !important;
  white-space: pre-wrap;
}

.medal-help {
  margin-left: 4%;
  font-size: 93%;
  white-space: pre-wrap;
}

.labelPreview {
  width: 0%;
  height: 0%;
  background-color: rgba(211, 211, 211, 0.85);
}

.dotted {
  border-style: dotted;
}

.edge-fixer {
  border: 0.01px solid rgba(255,255,255,0);
}

.preview {
  height: 100%;
}

.clear-button {
  font-size: 120%;
  font-weight: 700;
  margin: 2% 3% 2% 3%;
  text-align: center;
  padding: 2%;
  border-radius: 8px;
  width: 100%;
  border: 1px solid lightgrey;
  background: #ff5b5b;
  color: white;
  white-space: pre-wrap;
}

.dissabled-clear {
  background: #ff7373;
}

.medal-button {
  font-size: 120%;
  font-weight: 700;
  margin: 2% 3% 2% 3%;
  text-align: center;
  padding: 2%;
  border-radius: 8px;
  width: 100%;
  border: 1px solid lightgrey;
  background: rgba(255, 255, 255, 0.7);
  outline:none !important;
  outline-width: 0 !important;
  white-space: pre-wrap;
}

.slide-fade-enter-active {
  transition: all .4s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter
/* .slide-fade-leave-active below version 2.1.8 */  {
  transform: translateX(10px);
  opacity: 0;
}

/* Modal */

.modal-title{
  text-align: center;
  font-size: 140%;
  font-weight: bolder;
  white-space: pre-wrap;
}

.modal-body{
  text-align: center;
  font-size: 105%;
  white-space: pre-wrap;
}

/* Forms */

.pre-formatted {
  white-space: pre-wrap;
  padding: 5px;
  width: 90%;
  font-size: 75%;
}

.pre-formatted-left {
  white-space: pre-wrap;
  padding: 0px 5px 0px 10px;
  width: 90%;
  font-size: 75%;
  text-align: left;
  float: left;
}

.dissabled-text {
    opacity: 0.7;
}

.standard-input {
    float: left;
    margin-left: 4%;
    width: 75px;
    padding: 6%;
    border: 1px solid lightgrey;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
}

.green-input {
    float: left;
    margin-left: 3%;
    width: 80px;
    padding: 6%;
    border: 3px solid green;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
    border-color: #28a745;
    padding-right: calc(1.5rem);
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%2328a745" class="bi bi-check2" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>');
    background-repeat: no-repeat;
    background-size: 2rem 2.1rem;
    background-position: right 0.1rem center;
}

.orange-input {
    float: left;
    margin-left: 3%;
    width: 76px;
    padding: 6%;
    border: 3px solid orange;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
    padding-right: rem;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="orange" class="bi bi-exclamation-triangle" viewBox="0 0 16 16"><path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/><path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/></svg>');
    background-repeat: no-repeat;
    background-size: 1.4rem 1.4rem;
    background-position: right 0.2rem center;
}

.red-input {
    float: left;
    margin-left: 3%;
    width: 76px;
    padding: 6%;
    border: 3px solid red;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
    padding-right: calc(1.5rem);
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="%23FF0000" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>');
    background-repeat: no-repeat;
    background-size: 2rem 3rem;
    background-position: right 0rem center;
}


.tooltip {
  display: block !important;
  z-index: 10000;
}

.wideTooltip .tooltip-inner {
  background: none;
  color: white;
  border-radius: 16px;
  font-size: 110%;  
  max-width: 800px !important;
  width: 400px !important;
}

.tooltip .tooltip-inner {
  background: none;
  color: white;
  border-radius: 16px;
  font-size: 110%;
}

.red {
  background: rgb(255, 45, 45);
  border-radius: 16px;
  padding: 15px;
}

.orange {
  background: orange;
  border-radius: 16px;
  padding: 10px;
}

.tooltip[x-placement^="right"] {
  margin-top: 5px;
}

.tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity .15s;
}

</style>
