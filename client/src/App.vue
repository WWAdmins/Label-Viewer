<template>
    <div id="app" class="container-fluid main-backing col-lg-10 offset-lg-1">

        <div class='row'>
            <div class='col-lg-6'>
                <div class='row'>
                    <div class='col-lg-6'>
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
                    <div class='col-lg-6'>
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
                </div>
                <div>
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
                <div>
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
                </div>
                <div class="row">
                    <div class='col-lg-12'>
                        <button class="clear" v-if='!help' v-on:click="clearForm()" :disabled="!bottleSpec">Clear all</button>
                        <button class='help-button' v-if='!help' v-on:click="help = true">Help</button>
                        <button 
                            class='medal-button' 
                            v-if='!help && !medalMode' 
                            v-on:click="medalMode = !medalMode"
                            :disabled="labelStatuses.filled.length < globalPositions.activeLabels.length || globalPositions.activeLabels.length == 0 || globalPositions.activeMedals == 0"
                            >Medals
                        </button>
                        <button class='medal-button' v-if='!help && medalMode' v-on:click="medalMode = !medalMode">Labels</button>
                        <div class="alert alert-info alert-dismissible fade show" role="alert" v-if="help">
                            <button type="close-button" class="close" data-dismiss="alert" aria-label="Close" v-on:click="help = false">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <p class="pre-formatted help" v-html="helpMessage"></p>
                        </div>
                    </div>
                </div>
                <div class="row" v-if='help'>
                    <div class='col-lg-12'>
                        <button class="clear" v-on:click="clearForm()" :disabled="!bottleSpec">Clear all</button>
                        <button 
                            class='medal-button' 
                            v-if='help && !medalMode' 
                            v-on:click="medalMode = !medalMode"
                            :disabled="labelStatuses.filled.length < globalPositions.activeLabels.length || globalPositions.activeLabels.length == 0 || globalPositions.activeMedals == 0"
                            >Medals
                        </button>
                        <button class='medal-button' v-if='!help && medalMode' v-on:click="medalMode = !medalMode">Labels</button>
                    </div>
                </div>

                <div class="row" v-show="!medalMode || globalPositions.activeLabels.length == 0 || labelStatuses.filled.length != globalPositions.activeLabels.length">
                    <div class="col-lg-6">
                        <label class="header" v-if="bottleSpec">Front labels</label>
                        <label class="header dissabled-text" v-else>Front labels</label>
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
                            >
                        </measurements-form>
                        
                        <div class="slidecontainer" v-show="labelStatuses.hasWrap">
                            <input 
                                type="range" 
                                min=0 
                                max=100
                                value=50
                                class="slider"
                                id="centerSlider"
                                @input="sliderInput">
                        </div>

                        <label v-if="!labelStatuses.front.enabled">{{ labelStatuses.front.dissableMessage }}</label>
                        <div class="alert alert-warning" role="alert" id='frontDissabledWarning' v-if="!labelStatuses.front.enabled">{{ labelStatuses.front.dissableMessage }}</div>
                    </div>
                    <div class="col-lg-6">
                        <label class="header" v-if="bottleSpec">Back labels</label>
                        <label class="header dissabled-text" v-else>Back labels</label>
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
                            >
                        </measurements-form>
                        <div class="alert alert-warning invalidWarning" role="alert" id='backDissabledWarning' v-if="!labelStatuses.back.enabled">{{ labelStatuses.back.dissableMessage }}</div>
                    </div>
                </div>
                <div class="row" v-show="medalMode && globalPositions.activeLabels.length != 0 && labelStatuses.filled.length == globalPositions.activeLabels.length">
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
                            >
                    </measurements-form-medals>
                </div>
            </div>


            <div class='col-lg-6'>
                <div class="row">
                    <button id="frontDisplayButton" class="sideToggle selected" v-on:click="displaySelect('front')">Front view</button>
                    <button id="backDisplayButton" class="sideToggle" v-on:click="displaySelect('back')">Back view</button>
                </div>
                <label class='header' v-if="!bottleSpec">{{ selectHelpMessage }}</label>
                <br>
                <div class="row">
                    <div id="preview" class="col-lg-8 offset-lg-2 preview">

                        <div class="layer-2 labelPreview" id='labelPreviewLeft1'></div>
                        <div class="layer-2 labelPreview" id='labelPreviewRight1'></div>
                        <div class="layer-2 labelPreview" id='labelPreviewOverflowLeft1'></div>
                        <div class="layer-2 labelPreview" id='labelPreviewOverflowRight1'></div>

                        <div class="layer-3 labelPreview" id='labelPreviewLeft2'></div>
                        <div class="layer-3 labelPreview" id='labelPreviewRight2'></div>
                        <div class="layer-3 labelPreview" id='labelPreviewOverflowLeft2'></div>
                        <div class="layer-3 labelPreview" id='labelPreviewOverflowRight2'></div>

                        <div class="layer-4 medalPreview dotted" id='medalPreview1'></div>
                        <div class="layer-4 medalPreview" id='medalPreview2'></div>
                        <div class="layer-4 medalPreview" id='medalPreviewExtra1'></div>
                        <div class="layer-4 medalPreview" id='medalPreviewExtra2'></div>


                        <transition name="slide-fade">
                            <img v-if="bottleType == 'Burgundy' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/BRG_image.png">
                        </transition>
                        <transition name="slide-fade">
                            <img v-if="bottleType == 'Bordeaux' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/BDX_image.png">
                        </transition>
                        <transition name="slide-fade">
                            <img v-if="bottleType == 'Riesling' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/RIE_image.png">
                        </transition>
                        <transition name="slide-fade">
                            <img v-if="bottleType == 'Sparkling' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/SPK_image.png">
                        </transition>
                        <transition name="slide-fade">
                            <img v-if="bottleType == 'Magnum' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/MAG_image.png">
                        </transition>
                        <transition name="slide-fade">
                            <img v-if="bottleType == 'Premium Burgundy' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/PBG_image.png">
                        </transition>
                        
                        <div class='layer-10'>
                            <div class="alert alert-danger p-5 font-weight-bold" role="alert" id='invalidWarning' v-show="showInvalid">{{ overallWarning }}</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div id="previewLabel" class="col-lg-8 offset-lg-2 preview">
                        <transition name="slide-fade">
                            <label v-if="bottleType && bottleSpec" class="disclaimer" v-html=bottlePreviewDisclaimer></label>
                        </transition>
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
                    displaySide: 'front',                    // label preview stuff
                    validLabelOptions: [],
                    selectHelpMessage: '',

                    medalMode: false,    // toggle between labels and medals using button
                    centerSplit: 0.5,
                    centerSliderDelay: null
                }
        },

        mounted() {
                this.loadData();

                const helpLink = `<a href=${CONSTANTS.helpLink} class='alert-link'>here</a>`;
                this.helpMessage = CONSTANTS.helpMessage.replace("[help link here]", helpLink);

                this.overallWarning = CONSTANTS.invalidWarning;
                this.bottlePreviewDisclaimer = CONSTANTS.bottlePreviewDisclaimer;
                this.selectHelpMessage = CONSTANTS.selectHelpMessage;

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

                this.bottleSpec.recomended.minHeightOffset = Math.ceil(this.bottleSpec.recomended.minHeightOffset);
                this.bottleSpec.recomended.maxHeight = Math.floor(this.bottleSpec.recomended.maxHeight);
                this.bottleSpec.recomended.maxWidth = Math.floor(this.bottleSpec.recomended.maxWidth);
            },

            // Clears bottleSpec when bottleId is removed
            bottleRemove() {
                this.bottleSpec = null;
            },

            sliderInput(input) {
                    if (input.target.id == 'centerSlider') {
                        this.centerSplit = input.target.value / 100;
                        this.updatePreview();
                    }
            },

            // Dissables the back label if front label max width would define it as a wrap around
            checkWrapAround() {

                const wrapAroundBoundry = CONSTANTS.warpAroundDef * this.bottleSpec.circumference;
                if (this.globalPositions.front.maxWidth != null && this.globalPositions.front.maxWidth > wrapAroundBoundry) {
                    this.labelStatuses.back.enabled = false;
                    this.labelStatuses.back.dissableMessage = CONSTANTS.wrapAroundMessage;
                    this.labelStatuses.hasWrap = true;
                    if (this.globalPositions.activeLabels.includes('F2')) {
                        document.getElementById('frontF2').classList.add("hidden"); // This is done as it is simpler than trying to putting a v-show in a v-for that doesn't cover all components in the v-for
                    }
                } else {
                    this.labelStatuses.back.enabled = true;
                    this.labelStatuses.back.dissableMessage = '';
                    this.labelStatuses.hasWrap = false;
                    if (this.globalPositions.activeLabels.includes('F2')) {
                        document.getElementById('frontF2').classList.remove("hidden");    // This is done as it is simpler than trying to putting a v-show in a v-for that doesn't cover all components in the v-for
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
                    this.cleanLabel('B2', 'front', false);
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
            //        - Refs call is used as this is an event and it is not sutable to change the child's state
            // Resets globalPositions and labelStatuses, then calls checkWrapAround() and checkGlobalInvalid() to clear and reset any errors
            clearForm() {
                
                // Clear the orange zone warning as well? Just to be safe
                this.warned = false;

                if (this.globalPositions.activeLabels.includes('F2')) {
                    document.getElementById('frontF2').classList.remove("hidden");    // This is done as it is simpler than trying to putting a v-show in a v-for that doesn't cover all components in the v-for
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
                this.centerSplit = 0.5
                
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

                this.globalPositions[side][labelId] = form;     // Add/update new data to set

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
                            CONSTANTS.orangeZoneMeaage,
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

                this.globalPositions[side][labelId] = form;     // Add/update new data to set

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

            // Select which side the label preview is displaying and highlight the respective side's button
            // updates preview if there is a bottle spec
            // side: side of bottle, must be one of {'front', 'back'}
            displaySelect(side) {

                this.displaySide = side;
                switch (side) {
                    case 'front':
                        document.getElementById('frontDisplayButton').classList.add("selected");
                        document.getElementById('backDisplayButton').classList.remove("selected");
                        break;
                    case 'back':
                        document.getElementById('backDisplayButton').classList.add("selected");
                        document.getElementById('frontDisplayButton').classList.remove("selected");
                        break;
                    case 2:
                }
                if (this.bottleSpec != null) {
                    this.clearPreview();
                    this.updatePreview();
                }
            },

            prepLabels() {
                var labels = {'front': {}, 'back': {}};

                for (var idL of this.globalPositions.activeLabels) {
                    if (idL[0].toLowerCase() == 'f') {
                        labels.front[idL] = this.fetchDisplayMeasurementsLabel('front', idL);
                    } else if (idL[0].toLowerCase() == 'b') {
                        labels.back[idL] = this.fetchDisplayMeasurementsLabel('back', idL);
                    }
                }

                var main = {};
                var overflow = {};
                if (this.displaySide == 'front') {
                    main = labels.front;
                    overflow = labels.back;
                } else {
                    main = labels.back;
                    overflow = labels.front;
                }
                return {'main': main, 'overflow':overflow};
            },

            displayMainLabels(main) {
                const radius = this.bottleSpec.diameter/2;

                var label;
                for (var x in main) {
                    label = main[x];

                    if (label.thetaLeft <= Math.PI/2) {
                        label['adjustedWidthLeft'] = Math.sin(label.thetaLeft) * radius;
                    } else {
                        label['adjustedWidthLeft'] = radius;
                    }

                    if (label.thetaRight <= Math.PI/2) {
                        label['adjustedWidthRight'] = Math.sin(label.thetaRight) * radius;
                    } else {
                        label['adjustedWidthRight'] = radius;
                    }

                    this.displayLabel(false, x[1], label);
                }
            },

            displayOverflowLabels(overflow) {
                const radius = this.bottleSpec.diameter/2;

                var label;
                for (var y in overflow) {
                    label = overflow[y];

                    if (label.thetaLeft > Math.PI/2) {
                        label.thetaLeft -= Math.PI/2;
                        label['adjustedWidthLeft'] = radius - (Math.cos(label.thetaLeft) * radius);
                    } else {
                        label['adjustedWidthLeft'] = 0;
                    }

                    if (label.thetaRight > Math.PI/2) {
                        label.thetaRight -= Math.PI/2;
                        label['adjustedWidthRight'] = radius - (Math.cos(label.thetaRight) * radius);
                    } else {
                        label['adjustedWidthRight'] = 0;
                    }

                    this.displayLabel(true, y[1], label);
                }
            },

            displaymedals(medals) {
                const radius = this.bottleSpec.diameter/2;

                var medal;
                for (var x in medals) {
                    medal = medals[x];

                    if (medal.thetaLeftBeta >= Math.PI/2) { // Medal off the side
                        medal['adjustedWidthLeft'] = 0;
                    } else if (medal.thetaLeftBeta == 0 && medal.thetaLeftAlpha == 0) { // Alpha 0, beta 0 -->>> no left side medal
                        medal['adjustedWidthLeft'] = 0;
                    } else if (medal.thetaLeftAlpha <= Math.PI/2) {    // Alpha < Pi/2 -->>> left medal and it is inside bounds
                        medal['adjustedWidthLeft'] = radius * (Math.sin(medal.thetaLeftAlpha) - Math.sin(medal.thetaLeftBeta));
                    } else if (medal.thetaLeftBeta <= Math.PI/2 && medal.thetaLeftAlpha >= Math.PI/2) {
                        medal.thetaLeftAlpha = Math.PI/2;
                        medal['adjustedWidthLeft'] = radius * (Math.sin(medal.thetaLeftAlpha) - Math.sin(medal.thetaLeftBeta));
                    }

                    if (medal.thetaRightBeta >= Math.PI/2) { // Medal off the side
                        medal['adjustedWidthRight'] = 0;
                    } else if (medal.thetaRightBeta == 0 && medal.thetaRightAlpha == 0) { // Alpha 0, beta 0 -->>> no left side medal
                        medal['adjustedWidthRight'] = 0;
                    } else if (medal.thetaRightAlpha <= Math.PI/2) {    // Alpha < Pi/2 -->>> right medal and it is inside bounds
                        medal['adjustedWidthRight'] = radius * (Math.sin(medal.thetaRightAlpha) - Math.sin(medal.thetaRightBeta));
                    } else if (medal.thetaRightBeta <= Math.PI/2 && medal.thetaRightAlpha >= Math.PI/2) {
                        medal.thetaRightAlpha = Math.PI/2;
                        medal['adjustedWidthRight'] = radius * (Math.sin(medal.thetaRightAlpha) - Math.sin(medal.thetaRightBeta));
                    }

                    if (medal.thetaRightBeta == 0 && medal.thetaRightAlpha == 0) {  // All on left
                        medal['adjustedCenterOffset'] = Math.sin(medal.thetaLeftAlpha) * radius;
                    } else if (medal.thetaLeftBeta == 0 && medal.thetaLeftAlpha == 0) {  // All on left
                        medal['adjustedCenterOffset'] = Math.sin(medal.thetaRightBeta) * radius;
                    }

                    console.log(medal.thetaLeftBeta, medal.thetaRightBeta, medal.adjustedCenterOffset)
                    this.displayMedal(x[1], medal);
                }
            },

            // Todo: multi label support

            // Fetches label measurements, calculates warped 2D width based on bottle size, displays label
            //        - Fetching and display functionality is handeled in helper functions
            updatePreview() {
                // Labels *****************************
                const labels = this.prepLabels();
                const main = labels.main;
                const overflow = labels.overflow;

                this.displayMainLabels(main);
                this.displayOverflowLabels(overflow);

                // Medals *****************************
                var medals = {}
                for (var idM of this.globalPositions.activeMedals) {
                    medals[idM] = this.fetchDisplayMeasurementsMedal(idM);
                }

                this.displaymedals(medals);
                
            },

            // Fetches height and height offset for the specified label and calculates the width of the label as an angle on the radius of the bottle
            // Default values are 0, if a height offset of 0 is found the label is hidden
            fetchDisplayMeasurementsLabel(side, labelId) {

                var heightOffset = 0;
                var height = 0;
                var thetaLeft = 0;
                var thetaRight = 0;

                const label = this.globalPositions[side][labelId];
                if (label != null && label.valid) {
                    heightOffset = label.heightOffset;
                    height = label.height;

                    thetaLeft = (label.width * Math.PI) / this.bottleSpec.circumference;
                    thetaRight = (label.width * Math.PI) / this.bottleSpec.circumference;

                    if (this.labelStatuses.hasWrap) {
                        thetaLeft *= 2 * this.centerSplit;
                        thetaRight *= 2 * (1 - this.centerSplit);
                    }
                }
                if (heightOffset == 0) {    
                    height = 0;
                    thetaLeft = 0;
                    thetaRight = 0;
                }
                if (this.labelStatuses.hasWrap && labelId != 'F1') {    // Medals support here
                    height = 0;
                    thetaLeft = 0;
                    thetaRight = 0;
                }

                return {'heightOffset':heightOffset, 'height':height, 'thetaLeft':thetaLeft, 'thetaRight':thetaRight};
            },

            fetchDisplayMeasurementsMedal(medalId) {
                var heightOffset = 0;
                var height = 0;
                var thetaLeftAlpha = 0;
                var thetaLeftBeta = 0;
                var thetaRightAlpha = 0;
                var thetaRightBeta = 0;

                const medal = this.globalPositions.medal[medalId];
                if (medal != null && medal.valid) {

                    height = medal.height;
                    heightOffset = medal.VPlacement + this.globalPositions.front.F1.heightOffset;

                    var topLabelWidth;
                    if (this.globalPositions.activeLabels.includes('F2')) {
                        topLabelWidth = this.globalPositions.front.F2.width;
                    } else {
                        topLabelWidth = this.globalPositions.front.F1.width;
                    }
                    const center = ( (topLabelWidth + 2 * medal.height) * this.centerSplit );

                    if (medal.HPlacement <= center - medal.width) {
                        thetaLeftBeta = ((Math.abs(center - medal.HPlacement) - medal.width) * (Math.PI*2)) / this.bottleSpec.circumference;
                        thetaLeftAlpha = (Math.abs(center - medal.HPlacement) * (Math.PI/2)) / this.bottleSpec.circumference;
                    } else if (medal.HPlacement >= center) {
                        thetaRightBeta = ((Math.abs(center - medal.HPlacement) + medal.width) * (Math.PI*2)) / this.bottleSpec.circumference;
                        thetaRightAlpha = (Math.abs(center - medal.HPlacement) ) * (Math.PI/2) / this.bottleSpec.circumference;
                    } else {    // Annoying and in the middle (ugh)
                        thetaLeftAlpha = ( ( (center - medal.HPlacement) * 2*Math.PI) / this.bottleSpec.circumference );
                        thetaRightAlpha = ( ( (medal.HPlacement + medal.width - center) * (Math.PI/2)) / this.bottleSpec.circumference );
                    }
                }

                return {'heightOffset':heightOffset, 'height':height,
                        'thetaLeftAlpha':thetaLeftAlpha, 'thetaLeftBeta':thetaLeftBeta, 
                        'thetaRightAlpha':thetaRightAlpha, 'thetaRightBeta': thetaRightBeta};
            },

            // Sets demensions of the label preview on the bottle and places it in the right possition
            displayMedal(num, medal) {

                const diamiter = this.bottleSpec.diameter;
                const fullHeight = CONSTANTS[this.bottleType + "Height"];
                // {heightOffset, :height, thetaLeftAlpha, thetaLeftBeta, thetaRightAlpha, thetaRightBeta}

                if (medal.adjustedWidthLeft == 0) {  // medal is fully on the right
                    document.getElementById('medalPreview' + num).style.height = `${(medal.height/fullHeight)*100}%`;
                    document.getElementById('medalPreview' + num).style.width = `${(medal.adjustedWidthRight/diamiter)*100*0.47}%`;
                    document.getElementById('medalPreview' + num).style.bottom = `${(medal.heightOffset/fullHeight)*100}%`;
                    document.getElementById('medalPreview' + num).style.left = `${50 + (medal.adjustedCenterOffset/diamiter)*100}%`;
                } else if (medal.adjustedWidthRight == 0) { // Label is fully on the left
                    document.getElementById('medalPreview' + num).style.height = `${(medal.height/fullHeight)*100}%`;
                    document.getElementById('medalPreview' + num).style.width = `${(medal.adjustedWidthLeft/diamiter)*100*0.47}%`;
                    document.getElementById('medalPreview' + num).style.bottom = `${(medal.heightOffset/fullHeight)*100}%`;
                    document.getElementById('medalPreview' + num).style.left = `${50 - (medal.adjustedCenterOffset/diamiter)*100}%`;
                } else {    // It's in the middle and an absolute pain to deal with
                    document.getElementById('medalPreview' + num).style.height = `${(medal.height/fullHeight)*100}%`;
                    document.getElementById('medalPreview' + num).style.width = `${((medal.adjustedWidthRight + medal.adjustedWidthLeft)/diamiter)*100*0.47}%`;
                    document.getElementById('medalPreview' + num).style.bottom = `${(medal.heightOffset/fullHeight)*100}%`;
                    document.getElementById('medalPreview' + num).style.left = `${50 - (medal.adjustedWidthLeft/diamiter)*100}%`;
                }
            },

            // Clears all labels off label preview
            clearPreview() {
                const blank = {'height': 0, 'adjustedWidthLeft': 0, 'adjustedWidthRight': 0, 'heightOffset': 0}
                this.displayLabel(false, 1, blank);
                this.displayLabel(false, 2, blank);
                this.displayLabel(true, 1, blank);
                this.displayLabel(true, 2, blank);
                this.displayMedal(1, blank);
                this.displayMedal(2, blank);

                // clear medals
            },

            // Sets demensions of the label preview on the bottle and places it in the right possition
            displayLabel(isOverFlow, num, label) {

                const diamiter = this.bottleSpec.diameter;
                const fullHeight = CONSTANTS[this.bottleType + "Height"];

                if (!isOverFlow) {  // Front of label preview
                    document.getElementById('labelPreviewLeft' + num).style.height = `${(label.height/fullHeight)*100}%`;
                    document.getElementById('labelPreviewLeft' + num).style.width = `${(label.adjustedWidthLeft/diamiter)*100*0.47}%`;
                    document.getElementById('labelPreviewLeft' + num).style.bottom = `${(label.heightOffset/fullHeight)*100}%`;
                    document.getElementById('labelPreviewLeft' + num).style.left = `${50 - label.adjustedWidthLeft/diamiter*100*0.47}%`;

                    document.getElementById('labelPreviewRight' + num).style.height = `${(label.height/fullHeight)*100}%`;
                    document.getElementById('labelPreviewRight' + num).style.width = `${(label.adjustedWidthRight/diamiter)*100*0.47}%`;
                    document.getElementById('labelPreviewRight' + num).style.bottom = `${(label.heightOffset/fullHeight)*100}%`;
                    document.getElementById('labelPreviewRight' + num).style.left = `${50}%`;
                }
                if (isOverFlow) {
                    document.getElementById('labelPreviewOverflowLeft' + num).style.height = `${(label.height/fullHeight)*100}%`;
                    document.getElementById('labelPreviewOverflowLeft' + num).style.width = `${(label.adjustedWidthLeft/diamiter)*100*0.47}%`;
                    document.getElementById('labelPreviewOverflowLeft' + num).style.bottom = `${(label.heightOffset/fullHeight)*100}%`;
                    document.getElementById('labelPreviewOverflowLeft' + num).style.left = `${26.5}%`;

                    document.getElementById('labelPreviewOverflowRight' + num).style.height = `${(label.height/fullHeight)*100}%`;
                    document.getElementById('labelPreviewOverflowRight' + num).style.width = `${(label.adjustedWidthRight/diamiter)*100*0.47}%`;
                    document.getElementById('labelPreviewOverflowRight' + num).style.bottom = `${(label.heightOffset/fullHeight)*100}%`;
                    document.getElementById('labelPreviewOverflowRight' + num).style.left = `${100-26.5 - label.adjustedWidthRight/diamiter*100*0.47}%`;
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
    z-index: 3;
    position: absolute;
}

.medalPreview {
    width: 0%;
    height: 0%;
    background-color: goldenrod;
    opacity: 80%;
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

.medal-button {
    float: left;
    margin: 5px;
    text-align: center;
    padding: 3px 10px 3px;
    border-radius: 8px;
    border: 1px solid lightgrey;
    background: white;
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

.labelPreview {
    width: 0%;
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

.clear {
    float: right;
    margin: 5px;
    text-align: center;
    padding: 3px 10px 3px;
    border-radius: 8px;
    border: 1px solid lightgrey;
    background: white;
    opacity: 0.6;
    color: red;
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

.slide-fade-enter-active {
    transition: all .4s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-leave-active {
    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
    /* transform: translateX(10px); */
    opacity: 0;
}

</style>
