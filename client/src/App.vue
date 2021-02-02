<template>
  <div id="app">
    <div id="header" class="container-fluid main-backing col-lg-10 offset-lg-1">
      <div class="row">
        <div class="col-lg-2">
          <img class="image" alt="logo" src="./assets/logo_temp.png">
        </div>
        <div class="col-lg-10">
          <label>A really cool title that still needs to be formatted</label>
        </div>
      </div>
    </div>

    <div id="body" class="container-fluid main-backing col-lg-10 offset-lg-1">
    
      <div id="selectors" class="row">

        <div id="supplier" class="col-lg-5">
          <multiselect 
            id='supplierSelect'
            class='multi-select'
            v-model="supplier" 
            placeholder="select supplier"
            :options="suppliers" 
            :searchable="true" 
            :close-on-select="true"
            :select-label="''"
            :deselect-label="''"
            @select='supplierSelect'
            @remove='supplierRemove'
          >Supplier</multiselect>
        </div>

        <div id="bottle-type-id" class="col-lg-7">
          <div class="row">

            <div id="bottle-type" class="col-lg-6">
              <multiselect 
                class='multi-select'
                v-model="bottleType"
                placeholder="select bottle type" 
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

            <div id="bottle-id" class="col-lg-6">
              <multiselect 
                class='multi-select'
                v-model="bottleId"
                placeholder="select bottle" 
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

      </div>

      <div id="container-forms-preview" class="row">

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

              <label class="form-header" v-if="bottleSpec">{{titles.frontLabel}}</label>
              <label class="form-header dissabled-text" v-else>{{titles.frontLabel}}</label>

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

              <label class="form-header" v-if="bottleSpec">{{titles.backLabel}}</label>
              <label class="form-header dissabled-text" v-else>{{titles.backLabel}}</label>
                            
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
              >{{ labelStatuses.back.dissableMessage }}</div>

            </div>

            <button 
              class='medal-button' 
              v-if='!help && !medalMode' 
              v-on:click="medalMode = !medalMode"
              :disabled="labelStatuses.filled.length < globalPositions.activeLabels.length || globalPositions.activeLabels.length == 0 || globalPositions.activeMedals == 0"
            >{{titles.medalButton}}</button>

            <button 
              class="clear-button" 
              v-if='!help' 
              v-on:click="clearForm()" 
              :disabled="!bottleSpec"
            >{{titles.clearButton}}</button>

            

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
            >{{titles.labelButton}}</button>

            <button 
              class="clear-button" 
              v-if='!help' 
              v-on:click="clearForm()" 
              :disabled="!bottleSpec"
            >{{titles.clearButton}}</button>

          </div>

        </div>

        <div id="previews-col" class="col-lg-7">
          <br><br>

          <div id="previews" class="row">

            <div id="front-preview" class="col-lg-6 center">

              <div id="preview-header-front" class="row center">
                <div class="col-lg-12">
                  <label class='preview-header center' v-if="bottleSpec">{{titles.frontLabel}}</label>
                  <label class='preview-header center dissabled' v-else>{{titles.frontLabel}}</label>
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
                    <img v-if="bottleType == 'Burgundy' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/BRG_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Bordeaux' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/BDX_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Riesling' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/RIE_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Sparkling' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/SPK_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Magnum' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/MAG_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Premium Burgundy' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/PBG_image.png">
                  </transition>

                </div>
              </div>

            </div>

            <div id="back-preview" class="col-lg-6">

              <div id="preview-header-back" class="row">
                <div class="col-lg-12">
                  <label class='preview-header' v-if="bottleSpec">{{titles.backLabel}}</label>
                  <label class='preview-header dissabled' v-else>{{titles.backLabel}}</label>
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
                    <img v-if="bottleType == 'Burgundy' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/BRG_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Bordeaux' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/BDX_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Riesling' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/RIE_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Sparkling' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/SPK_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Magnum' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/MAG_image.png">
                  </transition>
                  <transition name="slide-fade">
                    <img v-if="bottleType == 'Premium Burgundy' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/BottleSilhouettes/PBG_image.png">
                  </transition>

                </div>
              </div>

            </div>

          </div>

          <transition name="slide-fade">
            <label v-if="bottleType && bottleSpec" class="disclaimer" v-html=bottlePreviewDisclaimer></label>
          </transition>

          <div class='layer-10'>
            <div class="alert alert-danger p-5 font-weight-bold invalid-alert" role="alert" id='invalidWarning' v-show="showInvalid">{{ overallWarning }}</div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  import measurementsForm from './components/measurementsForm.vue';
  import measurementsFormMedals from './components/measurementsFormMedals.vue';

  import dataImport from './assets/data.json';
  import CONSTANTS from './assets/CONSTANTS.json';


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

          titles: {}
        }
    },

    mounted() {
        this.loadData();

        this.titles = CONSTANTS.titles;

        const helpLink = `<a href=${CONSTANTS.help.helpLink} class='alert-link'>here</a>`;
        this.helpMessage = CONSTANTS.help.helpMessage.replace("[help link here]", helpLink);

        this.overallWarning = CONSTANTS.help.invalidWarning;
        this.bottlePreviewDisclaimer = CONSTANTS.help.bottlePreviewDisclaimer;
        this.selectHelpMessage = CONSTANTS.help.selectHelpMessage;

        this.validLabelOptions = [CONSTANTS.labelNames.F1, CONSTANTS.labelNames.B1];
    },

    methods: {
      
      // Load data into instance and sets supplier list for multiselect
      loadData() {
          this.data = dataImport;

          this.suppliers = Object.keys(this.data);
      },

      // When the supplier is selected, sets the list of options for the bottle types and clears all flieds that require supplier
      supplierSelect(supplierSelection) {
        this.bottleTypes = Object.keys(this.data[supplierSelection]);
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

      // When bottle type is selected and clears all flieds that require bottleType
      // Sets list of bottle ids and adds bottle name along side each bottle id (in form ("id - name"))
      bottleTypeSelect(bottleTypeSelection) {
        this.bottles = Object.keys(this.data[this.supplier][bottleTypeSelection]);
        for (var x in this.bottles) {
          this.bottles[x] += " - " + this.data[this.supplier][bottleTypeSelection][this.bottles[x]].name
        }
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

        const optimumZone = Math.round(CONSTANTS.optimumMedalZoneScale * this.bottleSpec.circumference / 2);
        this.medalPlacementHelp = CONSTANTS.help.medalPlacementHelp.replace("[measure here]", optimumZone);
      },

      // Clears bottleSpec when bottleId is removed
      bottleRemove() {
        this.bottleSpec = null;
      },

      // Dissables the back label if front label max width would define it as a wrap around
      checkWrapAround() {

        const wrapAroundBoundry = CONSTANTS.warpAroundDef * this.bottleSpec.circumference;
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
            this.showWarning(
              CONSTANTS.help.orangeZoneMeaage,
              'Caution:'
            );
            this.warned = true;
          }
        }
      },

      // Creates a popup modal to warn the user (uses simple-alert-for-vue-js)
      // Warning will have the specified title, body message and will display
      showWarning(Message, title) {
        this.$alert(
          Message,
          title,
          "warning"
        );
      },

      // Runs when a invalid input is found in a measurement form
      // Updates globalPositions
      emmittedInvalidLabel(payload) {
        const {labelId, side, type} = payload;

        this.globalPositions.latest = {'id': labelId, 'side':side, 'type':type};

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
  background-image: url('./assets/background.jpg');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  min-width: 350px;
}

.main-backing{
  margin-top: 60px;
  margin-bottom: 60px;
  border-radius: 8px;
  background-color: rgb(255,255,255,0.93);
  padding: 60px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
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

.pre-formatted {
  white-space: pre-wrap;
  padding: 5px;
}

.dissabled-text {
    opacity: 0.7;
}

.header {
  padding: 15px 10px 5px 10px;
  text-align: center;
  font-size: 20px;
}

.form-header {
  padding: 15px 10px 5px 10px;
  text-align: center;
  font-size: 20px;
}

.preview-header {
  padding: 15px 10px 5px 10px;
  text-align: center;
  font-size: 20px;
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
  margin: 5px;
  text-align: center;
  padding: 3px 10px 3px;
  border-radius: 8px;
  border: 1px solid lightgrey;
  background: #cffeff;
  opacity: 0.7;
  outline:none !important;
  outline-width: 0 !important;
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
}

.medal-help {
  margin-left: 1.8%;
  float: left;
  font-size: 93%;
}

.labelPreview {
  width: 0%;
  left: 50%;
  height: 0%;
  background-color: lightgrey;
  opacity: 80%;
}

.dotted {
  border-style: dotted;
}

.preview {
  height: 100%;
}

.clear-button {
  font-size: 120%;
  font-weight: 700;
  margin: 2% 4% 2% 4%;
  text-align: center;
  padding: 2%;
  border-radius: 8px;
  width: 100%;
  border: 1px solid lightgrey;
  background: #ff5b5b;
  color: white;
  outline:none !important;
  outline-width: 0 !important;
}

.medal-button {
  font-size: 120%;
  font-weight: 700;
  margin: 2% 4% 2% 4%;
  text-align: center;
  padding: 2%;
  border-radius: 8px;
  width: 100%;
  border: 1px solid lightgrey;
  background: white;
  opacity: 0.7;
  outline:none !important;
  outline-width: 0 !important;
}

.sideToggle {
  margin: 5px;
  text-align: center;
  padding: 3px 10px 3px;
  border-radius: 6px;
  border: 2px groove darkgray;
  background: lightgray;
  opacity: 0.9;
  outline:none !important;
  outline-width: 0 !important;
}

.selected {
  /* border-style: inset; */
  border: 2.5px inset #4ddbf7;
  opacity: 0.9;
  outline:none !important;
  outline-width: 0 !important;
}

</style>
