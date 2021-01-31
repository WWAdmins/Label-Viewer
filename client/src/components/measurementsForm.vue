<template>
    <div id=inputs>
        <hr v-if="labelId[1] > 1"> 
        <label class="sub-title-formatted" v-if="bottleSpec">Height</label>
        <label class="sub-title-formatted dissabled-text" v-else>Height</label>
        <div class='row'>
            <div class='col-sm-5'>
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
            <div class='col-sm-7'>
                <label class="pre-formatted" v-html="heightDescription"></label>
            </div>
        </div>
        <br>

        <label class="sub-title-formatted" v-if="bottleSpec">Width</label>
        <label class="sub-title-formatted dissabled-text" v-else>Width</label>
        <div class='row'>
            <div class='col-sm-5'>
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
            <div class='col-sm-7'>
                <label class="pre-formatted" v-html="widthDescription"></label>
            </div>
        </div>
        <br>

        <label class="sub-title-formatted" v-if="labelId[1] == 1 && bottleSpec">Application height</label>
        <label class="sub-title-formatted dissabled-text" v-if="labelId[1] == 1 && !bottleSpec">Application height</label>
        <label class="sub-title-formatted" v-if="labelId[1] == 2">Label gap</label>
        <label class="sub-title-formatted dissabled-text" v-if="labelId[1] == 2 && !bottleSpec">Label gap</label>
        <div class='row'>
            <div class='col-sm-5'>
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
            <div class='col-sm-7'>
                <label class="pre-formatted" v-html="heightOffsetDescription"></label>
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
                queue: []
            }
        },

        mounted() {
            if (this.bottleSpec != null) {
                this.updateHeightDescription();
                this.updateHeightOffsetDescription();
                this.updateWidthDescription();
            }
        },

        methods: {

            // When clear button is pressed
            // Clears inputs, sets all valid tags to true,
            // clears all warning strings, sets orange zone to false, sets all inputs to standard-input css
            clearForm() {
                // clear our form values
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
            },

            // On key press in input fields
            // Filters any key press that is not 0-9 or 'ArrowRight','ArrowLeft','Backspace', 'Tab'
            // (any filtered key presses are discarded)
            // if key down is 'Tab', force update to fields without timeout (prevents updates being skipped by quick change of field resetting timeout)
            keyDown() {
                const validKeys = ['ArrowRight','ArrowLeft','Backspace', 'Tab'];
                const keyRegex = /[0-9]/;
                if (!keyRegex.test(event.key) && validKeys.indexOf(event.key) < 0) {
                    event.preventDefault();
                } else if (event.key == 'Tab') {
                    this.validate(event.path[0].id.split("-")[2]);
                    if (event.path[0].id.split("-")[2] == 'height') {
                        this.updateHeightOffsetDescription();
                        this.updateWidthDescription();
                    }
                }
            },
            
            // Tiggered on keyup event in the form inputs. Delays action by 500ms to prevent unessacary calling while user is still typing
            // Input is the field that has been modified, this function can be expanded for more input, but the validate should be called before the height offset 
            // and width descriptions are updated as they check if the current height is valid while updating (see updateHeightOffsetDescription for more info)
            inputChange(input) {
                clearTimeout(this.delayTimer);
                this.delayTimer = setTimeout(()=>{
                    this.validate(input);
                    if (input == 'height') {
                        this.updateHeightOffsetDescription();
                        this.updateWidthDescription();
                    }
                }, 500);
            },


            // Updates the display of the current recommended boundry values for max height
            // The heightDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            updateHeightDescription() {
                if (this.bottleSpec == null) {
                    this.heightDescription = '';
                } else {
                    // Min height is a constant, but max height will vary with height offset and potential addition labels
                    var maxHeightrecommended = this.getMaxHeight('recommended');

                    if (maxHeightrecommended <= CONSTANTS.minLabelHeight) {
                        this.heightDescription = `recommended <b><b>${CONSTANTS.minLabelHeight}mm</b></b>`;
                    } else {
                        this.heightDescription = `recommended between <b><b>${CONSTANTS.minLabelHeight}mm</b></b> and <b><b>${maxHeightrecommended}mm</b></b>`;
                    }
                }
            },


            // Updates the display of the current recommended boundry values for max height offset
            // The heightOffsetDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            // This description will only update if the height is valid due to the use of the height in calculating max height offset
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
                                this.heightOffsetDescription = `recommended <b><b>${maxHeightOffsetWarning}mm</b></b>`;
                            } else {
                                this.heightOffsetDescription = `recommended <b><b>${minHeightoffsetrecommended}mm</b></b>`;
                            }
                        } else {
                            this.heightOffsetDescription = `recommended between <b><b>${minHeightoffsetrecommended}mm</b></b> and <b><b>${maxHeightOffsetrecommended}mm</b></b>`;
                        }
                    }
                }
            },


            // Updates the display of the current recommended boundry values for width
            // The widthDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            updateWidthDescription() {
                // Max width can vary with back and front label sizes
                if (this.bottleSpec == null) {
                    this.widthDescription = '';
                } else {
                    var maxWidthrecommended = this.getMaxWidth('recommended');
                    this.widthDescription = `recommended between <b><b>${CONSTANTS.minLabelWidth}mm</b></b> and <b><b>${maxWidthrecommended}mm</b></b>`;
                }
            },


            // Fetches the maximum possible height of the label using the type to specify which max height to use
            // If it is a primary label and a secondarylabel exists for that side, min label size and and are accounted for
            // IF secondary label, primary label height and height offset are accounted for
            // Type: {'warning', 'recommended'}
            getMaxHeight(type) {
                var maxHeight;
                if ((this.labelId == 'F1' && this.globalPositions.activeLabels.includes('F2')) || 
                    (this.labelId == 'B1' && this.globalPositions.activeLabels.includes('B2'))) { // If X1 label and X2 label exists
                    maxHeight = this.bottleSpec[type].maxHeight - CONSTANTS.minVerticalLabelGap.recommended - CONSTANTS.minLabelHeight - 4; // -4 to account for extra potential drift
                } else if (this.labelId == 'F2' || this.labelId == 'B2') {  // If label is an X2
                    maxHeight = this.bottleSpec[type].maxHeight - CONSTANTS.minVerticalLabelGap.recommended - CONSTANTS.minLabelHeight;

                    if (this.globalPositions[this.side][this.labelId[0] + '1'] != null) {   // if the measurements for X1 exist
                        const X1 = this.globalPositions[this.side][this.labelId[0] + '1'];
                        if (X1.height != '' && X1.height > CONSTANTS.minLabelHeight) {  // If the height exists and it is greater than the min height
                            maxHeight -= X1.height - CONSTANTS.minLabelHeight;
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
                // Primary label accounts for minimum measurements of secondary label
            // Type: {'warning', 'recommended'}
            getmaxHeightOffset(type) {
                var maxHeightOffset;
                const X1 = this.globalPositions[this.side][this.labelId[0]+'1'];
                if (this.labelId[1] != 1 && X1 != null) {   // If label is secondary and the primary label has measurements
                    maxHeightOffset = this.bottleSpec[type].maxHeight - (X1.height + X1.heightOffset - this.bottleSpec.recommended.minHeightOffset) - CONSTANTS.minVerticalLabelGap.recommended - CONSTANTS.minLabelHeight;

                    if (this.height != null && this.height >= CONSTANTS.minLabelHeight) { // If height is filled in
                        maxHeightOffset -= this.height - CONSTANTS.minLabelHeight;
                    }

                    if (maxHeightOffset < CONSTANTS.minVerticalLabelGap.recommended) {
                        maxHeightOffset = CONSTANTS.minVerticalLabelGap.recommended;
                    }
                } else {
                    if ((this.labelId == 'F1' && this.globalPositions.activeLabels.includes('F2')) || 
                        (this.labelId == 'B1' && this.globalPositions.activeLabels.includes('B2'))) { // If X1 label and X2 label exists
                        maxHeightOffset = this.bottleSpec[type].maxHeight + this.bottleSpec.recommended.minHeightOffset - CONSTANTS.minLabelHeight - CONSTANTS.minLabelHeight - CONSTANTS.minVerticalLabelGap.recommended
                    } else {
                        maxHeightOffset = this.bottleSpec[type].maxHeight + this.bottleSpec.recommended.minHeightOffset - CONSTANTS.minLabelHeight;
                    }
                    if (this.height !== null && this.height >= CONSTANTS.minLabelHeight) {
                        maxHeightOffset -= this.height - CONSTANTS.minLabelHeight;
                    }
                }
                return maxHeightOffset;
            },

            // Gets the minimum height offset of the label for the given type
            // Type: {'warning', 'recommended'}
            // If label is secondary the min height offset is the min vertical label gap
            // If label is primary the height offset is taken from the bottle spec
            getMinHeightOffset(type) {
                var minHeightOffset;
                const X1 = this.globalPositions[this.side][this.labelId[0]+'1'];
                if (this.labelId[1] != 1 && X1 != null) {
                    minHeightOffset = CONSTANTS.minVerticalLabelGap[type];
                } else {
                    minHeightOffset = this.bottleSpec[type].minHeightOffset;
                }
                return minHeightOffset;
            },


            // Fecthes the maximum possible width of the label using type to specify which max width to fetch
            // Accounts for width of labels on the other side of the bottle
            // Accounts for slope at top of orange zone
            // Wrap around definition is considered a maximum limit of the back label
            // When multiple constraints are all relavent (ie, constrained by another label and by height of label) the minimum value is taken
            // Type: {'warning', 'recommended'}
            getMaxWidth(type) {
                var heightAccountedMax = this.bottleSpec.warning.maxWidth;
                const wrapAroundBoundry = CONSTANTS.warpAroundDef * this.bottleSpec.circumference;
                if (this.side == 'back' && this.globalPositions.front.maxWidth != null) { // If back label, account for front label width
                    var sideAccountedMax;
                    if (type == 'warning') {
                        // account for slope section
                        if (this.validateHeight && this.height != '') {
                            const warningInfo = this.bottleSpec.warning;
                            heightAccountedMax = ( (this.height - warningInfo.UpointY) * ( (warningInfo.VpointX - warningInfo.maxWidth)/(warningInfo.maxHeight - warningInfo.UpointY) ) ) + warningInfo.maxWidth;
                        }
                        
                        sideAccountedMax = this.bottleSpec.circumference - (2 * CONSTANTS.minLabelGap.warning) - Math.round(this.globalPositions.front.maxWidth);
                        
                        return Math.min(sideAccountedMax, heightAccountedMax, this.bottleSpec.warning.maxWidth, wrapAroundBoundry);

                    } else if (type == 'recommended') {
                        sideAccountedMax = this.bottleSpec.circumference - (2 * CONSTANTS.minLabelGap.recommended) - Math.round(this.globalPositions.front.maxWidth);
                        return Math.min(sideAccountedMax, this.bottleSpec.recommended.maxWidth);
                    }
                } else {        // If not back label or no front label yet
                    if (type == 'warning') {
                        const warningInfo = this.bottleSpec.warning;
                        // account for slope section
                        if (this.validateHeight && this.height != '') {
                            
                            heightAccountedMax = ( (this.height - warningInfo.UpointY) * ( (warningInfo.VpointX - warningInfo.maxWidth)/(warningInfo.maxHeight - warningInfo.UpointY) ) ) + warningInfo.maxWidth;
                        }
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
            // input: field to be changed {'height', 'heightOffset', 'width'}
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
            // If a field is blank, validation is skipped and it is considered valid, but it's css class is set to standard-input
            // emits events for valid, invalid and orange zone (warning)
            // Validation details are handeled by helper functions
            validate(input) {
                if (this.labelId[1] != 1 && this.globalPositions[this.side][this.labelId[0]+'1'] != null) {
                    this.heightOffset = this.labelGap + this.globalPositions[this.side][this.labelId[0]+'1'].height + this.globalPositions[this.side][this.labelId[0]+'1'].heightOffset;
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

            // Checks the validity of the height field and sets validHeight, changes css setting of input and triggers warnings depending on validity
            validateHeight() {
                if (this.height < CONSTANTS.minLabelHeight) {  // too low
                    this.validHeight = false;
                    this.warnHeight = CONSTANTS.lowHeightWarning;
                    this.heightWarnClass = 'red';
                    this.setInputCss('height', 'red');
                } else if (this.height > this.getMaxHeight('recommended') && this.height <= this.getMaxHeight('warning')) { // warn
                    this.orangeZone = true;
                    this.validHeight = true;
                    this.warnHeight = CONSTANTS.orangeZoneWarning;
                    this.heightWarnClass = 'orange';
                    this.setInputCss('height', 'orange');
                } else if (this.height > this.getMaxHeight('warning')) { // too high
                    this.validHeight = false;
                    this.warnHeight = CONSTANTS.highHeightWarning;
                    this.heightWarnClass = 'red';
                    this.setInputCss('height', 'red');
                } else { // fine
                    this.validHeight = true;
                    this.warnHeight = null;
                    this.heightWarnClass = '';
                    this.setInputCss('height', 'green');
                }
            },

            // Checks the validity of the height field and sets validHeightOffset, changes css setting of input and triggers warnings depending on validity
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
                    this.warnHeightOffset = CONSTANTS.lowHeightOffsetWarning;
                    this.heightOffsetWarnClass = 'red';
                    this.setInputCss('heightOffset', 'red');
                } else if ((offset > this.getmaxHeightOffset('recommended') && offset <= this.getmaxHeightOffset('warning')) ||
                            (offset < this.getMinHeightOffset('recommended') && offset >= this.getMinHeightOffset('warning'))) { // warn
                    this.orangeZone = true;
                    this.validHeightOffset = true;
                    this.warnHeightOffset = CONSTANTS.orangeZoneWarning;
                    this.heightOffsetWarnClass = 'orange';
                    this.setInputCss('heightOffset', 'orange');
                } else if (offset > this.getmaxHeightOffset('warning')) { // too high
                    this.validHeightOffset = false;
                    this.warnHeightOffset = CONSTANTS.highHeightOffsetWarning;
                    this.heightOffsetWarnClass = 'red';
                    this.setInputCss('heightOffset', 'red');
                } else { // fine
                    this.validHeightOffset = true;
                    this.warnHeightOffset = null;
                    this.heightOffsetWarnClass = '';
                    this.setInputCss('heightOffset', 'green');
                }
            },

            // Checks the validity of the width field and sets validHeightOffset, changes css setting of input and triggers warnings depending on validity
            validateWidth() {
                if (this.width < CONSTANTS.minLabelWidth) { // too narrow
                    this.validWidth = false;
                    this.warnWidth = CONSTANTS.lowWidthWarning;
                    this.widthWarnClass = 'red';
                    this.setInputCss('width', 'red');
                } else if (this.width > this.getMaxWidth('recommended') && this.width <= this.getMaxWidth('warning')) { // warn
                    this.orangeZone = true;
                    this.validWidth = true;
                    this.warnWidth = CONSTANTS.orangeZoneWarning;
                    this.widthWarnClass = 'orange';
                    this.setInputCss('width', 'orange');
                } else if (this.width > this.getMaxWidth('warning')) { // too wide
                    this.validWidth = false;
                    this.warnWidth = CONSTANTS.highWidthWarning;
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
.pre-formatted {
  white-space: pre-wrap;
  padding: 5px;
  width: 90%;
  font-size: 75%;
}

.sub-title-formatted {
    white-space: pre-wrap;
    text-align: left;
    margin-left: 6%;
    width: 100%;
    font-weight: bold;
}

.dissabled-text {
    opacity: 0.7;
}

.standard-input {
    float: left;
    margin-left: 5%;
    width: 80px;
    padding: 6%;
    border: 1px solid lightgrey;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
}

.green-input {
    float: left;
    margin-left: 6%;
    width: 80px;
    padding: 6%;
    border: 3px solid green;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
    border-color: #28a745;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%2328a745" class="bi bi-check2" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>');
    background-repeat: no-repeat;
    background-size: 2rem 2.1rem;
    background-position: right 0.1rem center;
    min-width: 90px;
}

.orange-input {
    float: left;
    margin-left: 5%;
    width: 80px;
    padding: 6%;
    border: 3px solid orange;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;

    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="orange" class="bi bi-exclamation-triangle" viewBox="0 0 16 16"><path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/><path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/></svg>');
    background-repeat: no-repeat;
    background-size: 1.3rem 2rem;
    background-position: right 0.6rem center;
    min-width: 90px;
}

.red-input {
    float: left;
    margin-left: 5%;
    width: 80px;
    padding: 6%;
    border: 3px solid red;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;

    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="%23FF0000" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>');
    background-repeat: no-repeat;
    background-size: 2rem 3rem;
    background-position: right 0rem center;
    min-width: 90px;
}


.tooltip {
  display: block !important;
  z-index: 10000;
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
  margin-left: 5px;
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