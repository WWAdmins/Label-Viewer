<template>
    <div id=inputs>
        <hr v-if="labelId[1] > 1"> 
        <label class="sub-title-formatted" v-if="bottleSpec" v-html="titles.heightLabel"></label>
        <label class="sub-title-formatted dissabled-text" v-else v-html="titles.heightLabel"></label>
        
        <div class='row edge-fixer'>
            <div class='col-5'>
                <input
                    :disabled="!bottleSpec"
                    class="standard-input"
                    :id='labelId+"-input-height"'
                    v-model.number="height"
                    required
                    @keyup="inputChange('height')"
                    @keydown="keyDown"
                    v-tooltip.right="{ content: warnHeight, classes: heightWarnClass }"
                >
            </div>
            <div class='col-7'>
                <label class="pre-formatted-left" v-html="heightDescription"></label>
            </div>
        </div>
        <br>

        <label class="sub-title-formatted" v-if="bottleSpec" v-html="titles.widthLabel"></label>
        <label class="sub-title-formatted dissabled-text" v-else v-html="titles.widthLabel"></label>

        <div class='row edge-fixer'>
            <div class='col-5'>
                <input
                    :disabled="!bottleSpec"
                    class="standard-input"
                    :id='labelId+"-input-width"'
                    v-model.number="width"
                    required
                    @keyup="inputChange('width')"
                    @keydown="keyDown"
                    v-tooltip.right="{ content: warnWidth, classes: widthWarnClass }"
                >
            </div>
            <div class='col-7'>
                <label class="pre-formatted-left" v-html="widthDescription"></label>
            </div>
        </div>
        <br>


        <label class="sub-title-formatted" v-if="labelId[1] == 1 && bottleSpec" v-html="titles.appHeightLabel"></label>
        <label class="sub-title-formatted dissabled-text" v-if="labelId[1] == 1 && !bottleSpec" v-html="titles.appHeightLabel"></label>
        <label class="sub-title-formatted" v-if="labelId[1] == 2" v-html="titles.labelGapLabel"></label>
        <label class="sub-title-formatted dissabled-text" v-if="labelId[1] == 2 && !bottleSpec" v-html="titles.labelGapLabel"></label>
        
        <div class='row edge-fixer'>
            <div class='col-5'>
                <input
                    v-if="labelId[1] == 1"
                    :disabled="!bottleSpec"
                    class="standard-input"
                    :id='labelId+"-input-heightOffset"'
                    v-model.number="applicationHeight"
                    required
                    @keyup="inputChange('heightOffset')"
                    @keydown="keyDown"
                    v-tooltip.right="{ content: warnHeightOffset, classes: heightOffsetWarnClass }"
                >
                <input
                    v-if="labelId[1] == 2"
                    :disabled="!bottleSpec"
                    class="standard-input"
                    :id='labelId+"-input-heightOffset"'
                    v-model.number="labelGap"
                    required
                    @keyup="inputChange('heightOffset')"
                    @keydown="keyDown"
                    v-tooltip.right="{ content: warnHeightOffset, classes: heightOffsetWarnClass }"
                >
            </div>
            <div class='col-7'>
                <label class="pre-formatted-left" v-html="heightOffsetDescription"></label>
            </div>
        </div>
        <br>
    </div>
</template>

<script>
    import CONSTANTS from '../assets/CONSTANTS.json';

    export default {
        name: 'measurementsForm',
        
        props: {
            bottleSpec: {},
            labelId: {
                required: true
            },
            globalPositions: {},
            side: {
                default: 'front',
                type: String,
                validator: function (value) {
                    // The value must match one of these strings
                    return ['front', 'back'].indexOf(value) !== -1;
                }
            }
        },

        watch: {
            bottleSpec: {
                handler() {
                    if (this.bottleSpec != null) {
                        this.validate();
                        this.updateHeightDescription();
                        this.updateHeightOffsetDescription();
                        this.updateWidthDescription();
                    }  
                },
                deep: true
            },
            globalPositions: {
                // {'id': labelId, 'side':side, 'type':type}
                // Update for multi label
                handler() {
                    if (this.globalPositions.latest.id != this.labelId) {
                        
                        this.queue.push(this.globalPositions.latest.id);
                        clearTimeout(this.delayWatcherTimer);
                        this.delayWatcherTimer = setTimeout(()=>{
                            var ID;
                            while(this.queue.length > 0) {
                                ID = this.queue.shift();

                                if (this.labelId[1] == 2) {
                                    const X1 = this.globalPositions[this.side][this.labelId[0]+'1'];
                                    if (X1 != null) {
                                        this.heightOffset = this.labelGap + X1.height + X1.heightOffset;
                                    }
                                } else {
                                    this.heightOffset = this.applicationHeight;
                                }

                                if (ID == 'global') {
                                    this.validate('props');

                                    this.updateWidthDescription();
                                    this.updateHeightDescription();
                                    this.updateHeightOffsetDescription();
                                }
                                
                                if (ID == 'F1') {
                                    this.validate('props');

                                    this.updateWidthDescription();
                                    this.updateHeightDescription();
                                    this.updateHeightOffsetDescription();
                                } else if (this.side == 'back' && this.globalPositions.latest.side == 'front') {
                                    this.validate('props');
                                    this.updateWidthDescription();
                                } else if (ID == 'B1' && this.labelId == 'B2') {
                                    this.validate('props');
                                    this.updateWidthDescription();
                                    this.updateHeightDescription();
                                    this.updateHeightOffsetDescription();
                                }
                            }
                        }, 600);
                    }
                },
                deep: true
            }
        },

        data () {
            return {
                height: '',
                width: '',
                labelGap: '',
                applicationHeight: '',
                heightOffset: 0,
                heightDescription: "",
                heightOffsetDescription: "",
                widthDescription: "",
                delayTimer: null,
                valid: true,
                validHeight: true,
                validHeightOffset: true,
                validWidth: true,
                warnHeight: null,
                warnHeightOffset: null,
                warnWidth: null,
                orangeZone: false,
                heightWarnClass: '',
                heightOffsetWarnClass: '',
                widthWarnClass: '',
                queue: [],

                titles: {}
            }
        },

        mounted() {
            if (this.bottleSpec != null) {
                this.updateHeightDescription();
                this.updateHeightOffsetDescription();
                this.updateWidthDescription();
            }
            this.titles = CONSTANTS.titles;
        },

        methods: {

            // When clear button is pressed
            // Clears inputs, sets all valid tags to true,
            // clears all warning strings, sets orange zone to false, sets all inputs to standard-input css
            // Updates descriptions
            clearForm() {
                this.height = '';
                this.applicationHeight = '';
                this.labelGap = '';
                this.heightOffset = 0;
                this.width = '';

                this.validHeight = true;
                this.validHeightOffset = true;
                this.validWidth = true;
                this.valid = true;

                this.warnHeight = null;
                this.warnHeightOffset = null;
                this.warnWidth = null;
                this.orangeZone = false;
                this.setInputCss('height', 'standard');
                this.setInputCss('heightOffset', 'standard');
                this.setInputCss('width', 'standard');
                this.heightWarnClass = '';
                this.heightOffsetWarnClass = '';
                this.widthWarnClass = '';

                this.updateHeightDescription();
                this.updateHeightOffsetDescription();
                this.updateWidthDescription();
            },

            // On key press in input fields
            // Filters any key press that is not 0-9 or 'ArrowRight','ArrowLeft','Backspace', 'Tab'
            // (any filtered key presses are discarded)
            // If key down is 'Tab', force update to fields without timeout (prevents updates being skipped by quick change of field resetting timeout)
            // Note: validate should be called before the height offset description is updated as it checks if the current height
            //  is valid while updating (see updateHeightOffsetDescription for more info)
            // Calls validate
            // Calls updateHeightOffsetDescription (if needed)
            // event: key press event
            keyDown(event) {
                const validKeys = ['ArrowRight','ArrowLeft','Backspace', 'Tab'];
                const keyRegex = /[0-9]/;
                if (!keyRegex.test(event.key) && validKeys.indexOf(event.key) < 0) {
                    event.preventDefault();
                } else if (event.key == 'Tab') {
                    this.validate(event.target.id.split("-")[2]);
                    if (event.target.id.split("-")[2] == 'height') {
                        this.updateHeightOffsetDescription();
                    }
                }
            },
            
            // Tiggered on keyup event in the form inputs. Delays action by 500ms to prevent unessacary calling while user is still typing
            // Note: validate should be called before the height offset description is updated as it checks if the current height
            //  is valid while updating (see updateHeightOffsetDescription for more info)
            // Calls validate
            // Calls updateHeightOffsetDescription
            // input: the input that the change has come from 
            inputChange(input) {
                clearTimeout(this.delayTimer);
                this.delayTimer = setTimeout(()=>{
                    this.validate(input);
                    if (input == 'height') {
                        this.updateHeightOffsetDescription();
                    }
                }, 500);
            },


            // Updates the display of the current recommended boundry values for max height
            // Calls getMaxhHeight
            // Note: heightDescription should be displayed using a v-html directive for html formatting to display propperly (ie <label v-html='textVar'></label>)
            updateHeightDescription() {
                if (this.bottleSpec == null) {
                    this.heightDescription = '';
                } else {
                    // Min height is a constant, but max height will vary with height offset and potential addition labels
                    var maxHeightRecommended = this.getMaxHeight('recommended');

                    if (maxHeightRecommended <= CONSTANTS.data.minLabelHeight) {
                        this.heightDescription = CONSTANTS.descriptions.value.replace("${value}", CONSTANTS.data.minLabelHeight);
                    } else {
                        this.heightDescription = CONSTANTS.descriptions.between.replace("${min}", CONSTANTS.data.minLabelHeight).replace("${max}", maxHeightRecommended);
                    }
                }
            },


            // Updates the display of the current recommended boundry values for max height offset
            // Note: heightOffsetDescription should be displayed using a v-html directive for html formatting to display propperly (ie <label v-html='textVar'></label>)
            // This description will only update if the height is valid due to the use of the height in calculating max height offset
            // Calls: getmaxHeightOffset and getMinHeightOffset
            updateHeightOffsetDescription() {
                if (this.bottleSpec == null || !this.validHeight) {
                    this.heightOffsetDescription = '';
                } else {
                    if (this.validHeight) {
                        const maxHeightOffsetrecommended = this.getmaxHeightOffset('recommended');
                        const maxHeightOffsetWarning = this.getmaxHeightOffset('warning');
                        const minHeightoffsetrecommended = this.getMinHeightOffset('recommended');


                        if (maxHeightOffsetrecommended <= minHeightoffsetrecommended) {
                            if (maxHeightOffsetWarning <= minHeightoffsetrecommended) {
                                this.heightOffsetDescription = CONSTANTS.descriptions.value.replace("${value}", maxHeightOffsetWarning);
                            } else {
                                this.heightOffsetDescription = CONSTANTS.descriptions.value.replace("${value}", minHeightoffsetrecommended);
                            }
                        } else {
                            this.heightOffsetDescription = CONSTANTS.descriptions.between.replace("${min}", minHeightoffsetrecommended).replace("${max}", maxHeightOffsetrecommended);
                        }
                    }
                }
            },


            // Updates the display of the current recommended boundry values for width
            // The widthDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            // Calls: getMaxWidth
            updateWidthDescription() {
                // Max width can vary with back and front label sizes
                if (this.bottleSpec == null) {
                    this.widthDescription = '';
                } else {
                    var maxWidthrecommended = this.getMaxWidth('recommended');
                    this.widthDescription = CONSTANTS.descriptions.between.replace("${min}", CONSTANTS.data.minLabelWidth).replace("${max}", maxWidthrecommended);
                }
            },


            // Fetches the maximum possible height of the label using the type to specify which max height to use
            // If it is a primary label and a secondary label exists for that side, min label size and and are accounted for
            // If secondary label, primary label height and height offset are accounted for
            // type: {'warning', 'recommended'}
            // Returns: maxHeight
            getMaxHeight(type) {
                var maxHeight;
                if ((this.labelId == 'F1' && this.globalPositions.activeLabels.includes('F2')) || 
                    (this.labelId == 'B1' && this.globalPositions.activeLabels.includes('B2'))) { // If X1 label and X2 label exists
                    maxHeight = this.bottleSpec[type].maxHeight - CONSTANTS.data.minVerticalLabelGap.recommended - CONSTANTS.data.minLabelHeight - 4; // -4 to account for extra potential drift
                } else if (this.labelId == 'F2' || this.labelId == 'B2') {  // If label is an X2
                    maxHeight = this.bottleSpec[type].maxHeight - CONSTANTS.data.minVerticalLabelGap.recommended - CONSTANTS.data.minLabelHeight;

                    if (this.globalPositions[this.side][this.labelId[0] + '1'] != null) {   // if the measurements for X1 exist
                        const X1 = this.globalPositions[this.side][this.labelId[0] + '1'];
                        if (X1.height != '' && X1.height > CONSTANTS.data.minLabelHeight) {  // If the height exists and it is greater than the min height
                            maxHeight -= X1.height - CONSTANTS.data.minLabelHeight;
                        }
                        if (X1.heightOffset != '') {
                            maxHeight -= X1.heightOffset - this.bottleSpec.recommended.minHeightOffset;
                        }
                    }
                } else {
                    maxHeight = this.bottleSpec[type].maxHeight;
                }

                return maxHeight;
            },


            // Fetches the maximum possible height offset of the label using type to specify which max height offset to use
            // The max height offset takes the current label height entered by the user or the minimum label height into account (depending which is bigger)
            // If a primary and secondary label exists: 
                // Secondary label accounts for primary labels current measurements
                // Primary label accounts for minimum possible measurements of secondary label
            // type: {'warning', 'recommended'}
            // Returns: maxHeightOffset
            getmaxHeightOffset(type) {
                var maxHeightOffset;
                const X1 = this.globalPositions[this.side][this.labelId[0]+'1'];
                if (this.labelId[1] != 1 && X1 != null) {   // If label is secondary and the primary label has measurements
                    maxHeightOffset = this.bottleSpec[type].maxHeight - (X1.height + X1.heightOffset - this.bottleSpec.recommended.minHeightOffset) - CONSTANTS.data.minVerticalLabelGap.recommended - CONSTANTS.data.minLabelHeight;

                    if (this.height != null && this.height >= CONSTANTS.data.minLabelHeight) { // If height is filled in
                        maxHeightOffset -= this.height - CONSTANTS.data.minLabelHeight;
                    }

                    if (maxHeightOffset < CONSTANTS.data.minVerticalLabelGap.recommended) {
                        maxHeightOffset = CONSTANTS.data.minVerticalLabelGap.recommended;
                    }
                } else {
                    if ((this.labelId == 'F1' && this.globalPositions.activeLabels.includes('F2')) || 
                        (this.labelId == 'B1' && this.globalPositions.activeLabels.includes('B2'))) { // If X1 label and X2 label exists
                        maxHeightOffset = this.bottleSpec[type].maxHeight + this.bottleSpec.recommended.minHeightOffset - CONSTANTS.data.minLabelHeight - CONSTANTS.data.minLabelHeight - CONSTANTS.data.minVerticalLabelGap.recommended
                    } else {
                        maxHeightOffset = this.bottleSpec[type].maxHeight + this.bottleSpec.recommended.minHeightOffset - CONSTANTS.data.minLabelHeight;
                    }
                    if (this.height !== null && this.height >= CONSTANTS.data.minLabelHeight) {
                        maxHeightOffset -= this.height - CONSTANTS.data.minLabelHeight;
                    }
                }
                return maxHeightOffset;
            },

            // Gets the minimum height offset of the label for the given type
            // If label is secondary the min height offset is the min vertical label gap
            // If label is primary the height offset is taken from the bottle spec
            // type: {'warning', 'recommended'}
            // Returns: minHeightOffset
            getMinHeightOffset(type) {
                var minHeightOffset;
                const X1 = this.globalPositions[this.side][this.labelId[0]+'1'];
                if (this.labelId[1] != 1 && X1 != null) {
                    minHeightOffset = CONSTANTS.data.minVerticalLabelGap[type];
                } else {
                    minHeightOffset = this.bottleSpec[type].minHeightOffset;
                }
                return minHeightOffset;
            },


            // Fecthes the maximum possible width of the label using type to specify which max width to fetch
            // Accounts for width of labels on the other side of the bottle
            // Accounts for slope at top of orange zone
            // Wrap around definition is considered a maximum limit for the back label and additional front labels
            // When multiple constraints are all relavent (ie, constrained by another label and by height of label) the minimum value is taken
            // type: {'warning', 'recommended'}
            // Returns: minimum max width from the appripreate options {sideAccountedMax, heightAccountedMax, this.bottleSpec.[type].maxWidth, wrapAroundBoundry}
            getMaxWidth(type) {
                
                const wrapAroundBoundry = CONSTANTS.data.warpAroundDef * this.bottleSpec.circumference;

                // account for slope section
                var heightAccountedMax;
                if (this.validateHeight && this.height != '') {
                    const warningInfo = this.bottleSpec.warning;
                    heightAccountedMax = ( (this.height - warningInfo.UpointY) * ( (warningInfo.VpointX - warningInfo.maxWidth)/(warningInfo.maxHeight - warningInfo.UpointY) ) ) + warningInfo.maxWidth;
                } else {
                    heightAccountedMax = this.bottleSpec.warning.maxWidth;
                }

                if (this.side == 'back' && this.globalPositions.front.maxWidth != null) { // If back label, account for front label width
                    const sideAccountedMax = this.bottleSpec.circumference - (2 * CONSTANTS.data.minLabelGap[type]) - Math.round(this.globalPositions.front.maxWidth);

                    if (type == 'warning') {
                        return Math.min(sideAccountedMax, heightAccountedMax, this.bottleSpec.warning.maxWidth, wrapAroundBoundry);
                    } else if (type == 'recommended') {
                        return Math.min(sideAccountedMax, this.bottleSpec.recommended.maxWidth);
                    }

                } else {        // If not back label or no front label yet
                    if (type == 'warning') {
                        
                        if (this.labelId != 'F1') {
                            return Math.min(heightAccountedMax, this.bottleSpec.warning.maxWidth, wrapAroundBoundry);
                        } else {
                            return Math.min(heightAccountedMax, this.bottleSpec.warning.maxWidth);
                        }

                    } else if (type == 'recommended') {
                        return this.bottleSpec.recommended.maxWidth;
                    }
                }
            },

            // Set the provided input to the given setting's css class
            // input: id of input to be changed {'height', 'heightOffset', 'width'}
            // setting: {'green', 'orange', 'red', 'standard'}
            setInputCss(input, setting) {
                var inputId = this.labelId + '-input-' + input;

                var element = document.getElementById(inputId);

                if (element == null) {
                    return;
                }

                element.classList.remove("orange-input");
                element.classList.remove("red-input");
                element.classList.remove("green-input");
                element.classList.remove("standard-input");
                this.$nextTick(function () {
                    switch (setting) {
                    case 'green':
                        element.classList.add("green-input");
                        break;
                    case 'orange':
                        element.classList.add("orange-input");
                        break;
                    case 'red':
                        element.classList.add("red-input");
                        break;
                    case 'standard':
                        element.classList.add("standard-input");
                        break;
                    }
                })
                
                
            },


            // Takes the provided user measurments and validates them against the currently selected spec
            // Calculates current height offset using appliation height of label gap
            // If a field is blank, validation is skipped and it is considered valid, but it's css class is set to standard-input
            // emits events for valid, invalid and orange zone (warning)
            // Calls: setInputCss
            // Calls: validateHeight, validateHeightOffset and validateWidth
            validate(input) {
                if (this.labelId[1] != 1 && this.globalPositions[this.side][this.labelId[0]+'1'] != null) { // If secondary label and primary label is not null
                    const X1 = this.globalPositions[this.side][this.labelId[0]+'1'];
                    if (X1.heightOffset != 0 && X1.heightOffset != null && this.labelGap != '') {
                        this.heightOffset = this.labelGap + X1.height + X1.heightOffset;
                    } else {
                        this.heightOffset = '';
                    }
                } else {
                    this.heightOffset = this.applicationHeight;
                }

                this.orangeZone = false;

                if (this.height == '' || this.height == null) {
                    this.validHeight = true;
                    this.warnHeight = null;
                    this.heightWarnClass = '';
                    this.setInputCss('height', 'standard');
                } else {
                    this.validateHeight();
                }
                
                if (this.heightOffset == '' || this.heightOffset == null || (this.applicationHeight == '' && this.labelId[1] == 1) || (this.labelGap == '' && this.labelId[1] == 2)) {
                    this.validHeightOffset = true;
                    this.warnHeightOffset = null;
                    this.heightOffsetWarnClass = '';
                    this.setInputCss('heightOffset', 'standard');
                } else {
                    this.validateHeightOffset();
                }

                if (this.width == '' || this.width == null) {
                    this.validWidth = true;
                    this.warnWidth = null;
                    this.widthWarnClass = '';
                    this.setInputCss('width', 'standard');
                } else {
                    this.validateWidth();
                }

                this.valid = this.validHeight && this.validHeightOffset && this.validWidth;

                const form = {
                    'height': this.height,
                    'heightOffset': this.heightOffset,
                    'width': this.width,
                    'valid': this.valid
                };

                // Address "global level" warnings here
                if (!this.valid) {
                    this.$emit('invalid', {'labelId':this.labelId, 'side':this.side, 'type': input});
                } else {
                    this.$emit('valid', {'form':form, 'labelId':this.labelId, 'side':this.side, 'type': input});
                }
                if (this.orangeZone) {
                    this.$emit('warning', {'warning':'orange zone', 'labelId':this.labelId, 'side':this.side, 'type': input, 'form':form});
                }
            },

            // Checks the validity of the height field and sets validHeight
            // Calls: setInputCss
            // Triggers warnings depending on validity and sets apprepreate warning strings
            validateHeight() {
                if (this.height < CONSTANTS.data.minLabelHeight) {  // too low
                    this.validHeight = false;
                    this.warnHeight = CONSTANTS.warning.lowHeightWarning;
                    this.heightWarnClass = 'red';
                    this.setInputCss('height', 'red');
                } else if (this.height > this.getMaxHeight('recommended') && this.height <= this.getMaxHeight('warning')) { // warn
                    this.orangeZone = true;
                    this.validHeight = true;
                    this.warnHeight = CONSTANTS.warning.orangeZoneWarning;
                    this.heightWarnClass = 'orange';
                    this.setInputCss('height', 'orange');
                } else if (this.height > this.getMaxHeight('warning')) { // too high
                    this.validHeight = false;
                    this.warnHeight = CONSTANTS.warning.highHeightWarning;
                    this.heightWarnClass = 'red';
                    this.setInputCss('height', 'red');
                } else { // fine
                    this.validHeight = true;
                    this.warnHeight = null;
                    this.heightWarnClass = '';
                    this.setInputCss('height', 'green');
                }
            },

            // Checks the validity of the heightOffset and sets validHeightOffset
            // If height is invalid, calls setInputCss with 'standard' style reference and dissables height offset warnings
            // Calls: setInputCss
            // Triggers warnings depending on validity and sets apprepreate warning strings
            validateHeightOffset() {
                if (!this.validHeight) {
                    this.setInputCss('heightOffset', 'standard');
                    this.heightOffsetWarnClass = '';
                    return;
                }
                
                var offset;
                if (this.labelId[1] == 1) { // If this is a first label
                    offset = this.heightOffset;
                } else {    // If this is a second label
                    offset = this.labelGap;
                }

                if (offset < this.getMinHeightOffset('warning')) { // too low
                    this.validHeightOffset = false;
                    this.warnHeightOffset = CONSTANTS.warning.lowHeightOffsetWarning;
                    this.heightOffsetWarnClass = 'red';
                    this.setInputCss('heightOffset', 'red');
                } else if ((offset > this.getmaxHeightOffset('recommended') && offset <= this.getmaxHeightOffset('warning')) ||
                            (offset < this.getMinHeightOffset('recommended') && offset >= this.getMinHeightOffset('warning'))) { // warn
                    this.orangeZone = true;
                    this.validHeightOffset = true;
                    this.warnHeightOffset = CONSTANTS.warning.orangeZoneWarning;
                    this.heightOffsetWarnClass = 'orange';
                    this.setInputCss('heightOffset', 'orange');
                } else if (offset > this.getmaxHeightOffset('warning')) { // too high
                    this.validHeightOffset = false;
                    this.warnHeightOffset = CONSTANTS.warning.highHeightOffsetWarning;
                    this.heightOffsetWarnClass = 'red';
                    this.setInputCss('heightOffset', 'red');
                } else { // fine
                    this.validHeightOffset = true;
                    this.warnHeightOffset = null;
                    this.heightOffsetWarnClass = '';
                    this.setInputCss('heightOffset', 'green');
                }
            },

            // Checks the validity of the width field and sets validWidth
            // Calls: setInputCss
            // Triggers warnings depending on validity and sets apprepreate warning strings
            validateWidth() {
                if (this.width < CONSTANTS.data.minLabelWidth) { // too narrow
                    this.validWidth = false;
                    this.warnWidth = CONSTANTS.warning.lowWidthWarning;
                    this.widthWarnClass = 'red';
                    this.setInputCss('width', 'red');
                } else if (this.width > this.getMaxWidth('recommended') && this.width <= this.getMaxWidth('warning')) { // warn
                    this.orangeZone = true;
                    this.validWidth = true;
                    this.warnWidth = CONSTANTS.warning.orangeZoneWarning;
                    this.widthWarnClass = 'orange';
                    this.setInputCss('width', 'orange');
                } else if (this.width > this.getMaxWidth('warning')) { // too wide
                    this.validWidth = false;
                    this.warnWidth = CONSTANTS.warning.highWidthWarning;
                    this.widthWarnClass = 'red';
                    this.setInputCss('width', 'red');
                } else { // fine
                    this.validWidth = true;
                    this.warnWidth = null;
                    this.widthWarnClass = '';
                    this.setInputCss('width', 'green');
                }
            }

        }

    }


</script>

<style>

.sub-title-formatted {
    white-space: pre-wrap;
    text-align: left;
    width: 100%;
    font-weight: bold;
    float: left;
    margin-left: 3%;
}

</style>