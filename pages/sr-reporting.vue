<template>
  <b-container fluid class="pt-3">

    <h1 class="h2 mb-4">Sub-Region Vaccine Reports</h1>

    <b-card class="mb-4">

      <h2 class="h3">1. Province and Date</h2>
    
      <b-form-group label="Province" class="province-select">
        <span v-for="(province, index) in provinces"
              v-bind:key="index"
              class="mr-1">
          <b-button v-on:click="setProvince(index)"
                    v-bind:variant="isSelected(province.code)"
                    v-bind:disabled="reportLoaded"
                    v-bind:title="province.name">
          {{ province.code }}</b-button></span>
      </b-form-group>

      <b-form-group label="Date" class="w-50 mb-3">
        <b-form-datepicker :min="dateOptions.min"
                           :max="dateOptions.max"
                           v-model="form.date"
                           v-bind:disabled="reportLoaded"></b-form-datepicker>
      </b-form-group>

      <div class="d-flex align-items-center">
        <b-button v-on:click="loadReport()"
                  v-if="! reportLoaded"
                  v-bind:disabled="selectedProvince === null"
                  variant="primary">Load Report</b-button>

        <b-spinner label="Loading report" class="ml-2" v-if="loading"></b-spinner>
      </div>

    </b-card>

    <b-card v-if="reportLoaded">

      <div class="h5">
        <b-badge v-on:click="resetReport()"
                 v-if="reportLoaded"
                 class="align-top fs-6"
                 href="#"
                 variant="warning">Select a different Province or Date</b-badge>
      </div>

      <h2 class="my-4">
        <span class="h3">2. Sub Regions</span>
      </h2>

      <b-table-simple fixed striped bordered v-if="regions && !loading" class="report-table report-table-th" v-bind:class="tableCompact ? 'compact' : ''">
        <b-thead head-variant="dark">
          <b-tr>
            <b-th></b-th>
            <b-th v-for="(attr, index) in fillableAttrs" v-bind:key="index">{{ attr }}</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="region in regions" v-bind:key="region.code">
            <b-th>
              <p>{{ region.region }}</p>
              <ul class="list-unstyled region-info">
                <li class="hide-compact">{{ region.zone }}</li>
                <li class="hide-compact">Pop. {{ region.population || "--" }}</li>
                <li>{{ region.code }}</li>
              </ul>
            </b-th>
            <b-th v-for="(attr, key) in fillableAttrs" v-bind:key="key">
              <template v-if="attrInputTypes[key] === 'percent'">
                <b-input type="number" size="sm" min="0" max="1" maxlength="7" step="any" v-bind:title="attr" v-model="srVaccineReports[region.code][key]" />
                <p v-if="srVaccineReports[region.code][key.replace('percent', 'source')] === 'percent'" class="source-label">{{ sourceLabel }}</p>
              </template>
              <template v-else-if="attrInputTypes[key] === 'total'">
                <b-input type="number" size="sm" min="0" v-bind:title="attr" v-model="srVaccineReports[region.code][key]" />
                <p v-if="srVaccineReports[region.code][key.replace('total', 'source')] === 'total'" class="source-label">{{ sourceLabel }}</p>
              </template>
            </b-th>
          </b-tr>
        </b-tbody>
      </b-table-simple>

      <b-button v-on:click="saveReport()"
                v-bind:disabled="saving"
                variant="primary">Save Report</b-button>

      <b-spinner label="Saving report" v-if="saving"></b-spinner>

      <b-alert v-model="alert.show" v-bind:variant="alert.variant || 'info'" dismissible class="mt-3">
        <strong>{{ alert.title }}</strong> {{ alert.description }}
      </b-alert>

    </b-card>

  </b-container>
</template>

<script>
  export default {
    middleware: 'auth',
    data: function() {
      return {
        doses: 3,
        attrs: {
          'total_dose_1': 'Dose 1 Total',
          'percent_dose_1': 'Dose 1 Percent',
          'source_dose_1': 'Dose 1 Source',
          'total_dose_2': 'Dose 2 Total',
          'percent_dose_2': 'Dose 2 Percent',
          'source_dose_2': 'Dose 2 Source',
          'total_dose_3': 'Dose 3 Total',
          'percent_dose_3': 'Dose 3 Percent',
          'source_dose_3': 'Dose 3 Source',
        },
        attrInputTypes: {},
        baseAttrs: null,
        sourceLabel: 'Source Value',
        provinces: [],
        regions: [],
        regionHash: {},
        loading: false,
        selectedProvince: null,
        form: {
          province: null,
          date: null,
        },
        srVaccineReports: {},
        reportLoaded: false,
        tableCompact: false,
        dateOptions: {
          min: new Date('2021-01-01'),
          max: new Date(),
        },
        saving: false,
        alert: {
          show: false,
          variant: null,
          title: '',
          description: '',
        },
      }
    },
    created() {
      this.loadOptions();
      this.form.date = this.currentDate();
      // set input types
      for (let attr in this.attrs) {
        let parts = attr.split('_');
        this.attrInputTypes[attr] = parts[0];
      }
    },
    methods: {

      /**
       * loads initial options
       */
      loadOptions() {
        this.$axios.$get('sub-regions/provinces')
          .then(response => {
            if( this.$auth.user.role !== 'admin' ) {
              let whitelist = this.$auth.user.provinces.map( p => p.code );
              this.provinces = response.filter( r => whitelist.includes(r.code ) );
            } else {
              this.provinces = response;
            }
          })
          .catch(errors => {
            console.dir(errors);
          });
      },

      /**
       * helper to pull user Y-m-d
       */
      currentDate() {
        let d = new Date();
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
      },

      /**
       * selects a province
       */
      setProvince(index) {
        // assign province
        this.selectedProvince = index;
        this.form.province = this.provinces[index].code;
      },

      /**
       * loads report based on selected province and date
       */
      loadReport() {
        this.loading = true;
        // fetch data from API
        this.$axios.$get(`manage/sr-report/${this.form.province}`, {'params': { 'date': this.form.date }})
          .then(response => {
            // load regions
            this.regions = response.regions;
            // default attributes (null)
            // create v-model for each sub-region
            this.regions.forEach((r, index) => {
              let defaultAttrs = Object.keys(JSON.parse(JSON.stringify(this.attrs)))
                                   .reduce((a, k)=> (a[k] = null,a),{});
              this.srVaccineReports[r.code] = defaultAttrs;
              // store index reference
              this.regionHash[r.code] = index;
            });
            // prefill any existing region data
            if( Array.isArray(response.sr_vaccine_reports) ) {
              let keys = Object.keys(this.attrs);
              // loop through each returned report
              response.sr_vaccine_reports.forEach(r => {
                // look for attributes we want
                keys.forEach(attr => {
                  if( r[attr] !== undefined && this.srVaccineReports[r.code] !== undefined ) {
                    this.srVaccineReports[r.code][attr] = r[attr];
                  }
                });
              });
            }
            // complete
            this.loading = false;
            this.reportLoaded = true;
          })
          .catch(errors => {
            console.dir(errors);
          });
        // amp
        this.$amplitude.getInstance().logEvent('load_sr_report', {'province': this.form.province, 'date': this.form.date});
      },

      /**
       * saves current report (post)
       */
      saveReport() {
        this.saving = true;
        this.alert.show = false;
        // prepare payload, start with basic values
        const payload = JSON.parse(JSON.stringify( this.form ));
        // attach health region reports
        payload.sr_report = {};
        // calculate (or not) for each region
        for (let region in this.srVaccineReports) {
          let report = JSON.parse(JSON.stringify( this.srVaccineReports[region] ));
          // loop for each available dose
          for (let d = 1; d <= this.doses; d++) {
            let total_attr = `total_dose_${d}`;
            let percent_attr = `percent_dose_${d}`;
            let source_attr =  `source_dose_${d}`;
            // try to determine if there should be a source
            // if total set but percent not, then total is source
            if( !this.isEmpty(report[total_attr]) &&
                this.isEmpty(report[percent_attr]) ) {
              report[source_attr] = 'total';
            // if percent set but total not, then total is source
            } else if ( this.isEmpty(report[total_attr]) &&
                        !this.isEmpty(report[percent_attr]) ) {
              report[source_attr] = 'percent';
            // reset field if both are empty
            } else if ( this.isEmpty(report[total_attr]) &&
                        this.isEmpty(report[percent_attr]) ) {
              report[source_attr] = null;
            }
            // calculate other field based on source_attr
            // check if region has population
            let pop = this.regions[this.regionHash[region]].population;
            if( pop ) {
              if( report[source_attr] === 'total' ) {
                report[percent_attr] = parseFloat(report[total_attr] / pop).toFixed(5);
              } else if( report[source_attr] === 'percent' ) {
                report[total_attr] = parseFloat(report[percent_attr] * pop).toFixed(0);
              }
            }
            // save values to payload
            payload.sr_report[region] = report;
          }
        }
        // post
        this.$axios.$post( `manage/sr-report`, payload )
          .then(response => {
            this.alert.variant = 'success';
            this.alert.title = response.message;
            this.alert.description = `(${response.province}, ${response.date})`;
            this.alert.show = true;
            // done
            this.saving = false;
          })
          .catch(error => {
            this.alert.variant = 'danger';
            this.alert.show = true;
            this.alert.title = '';
            this.alert.description = error.response.data.message;
            this.saving = false;
          });
        // amp
        this.$amplitude.getInstance().logEvent('save_sr_report', {'province': this.form.province, 'date': this.form.date});
      },

      /**
       * checks if code matches selected province
       */
      isSelected(code) {
        return this.form.province === code ? 'primary' : 'outline-secondary';
      },

      /**
       * helper if value is empty
       */
      isEmpty(value) {
        return value === null || value === undefined || value === '';
      },

      /**
       * helper to reset the report form (changing province/date)
       */
      resetReport() {
        this.srReports = {};
        this.reportLoaded = false;
        this.regionHash = {};
      },

      /**
       * constricts/expands first column in hr_reports for smaller viewports
       */
      toggleCompact() {
        this.tableCompact = !this.tableCompact;
      },
      
    },
    computed: {

      /** 
       * fillable attrs
       */
      fillableAttrs() {
        let { source_dose_1, source_dose_2, source_dose_3, ...attrs } = this.attrs;
        return attrs;
      },

    },
  }
</script>

<style>

  .region-info {
    line-height: 1.25;
    font-size: 0.75rem;
    font-weight: normal;
    opacity: 0.75;
  }

  .source-label {
    font-weight: normal;
    font-size: 0.75rem;
    text-align: center;
    background: rgba(0,0,0,0.1);
    margin-top: 0.25rem;
    border-radius: 0.25rem;
  }

  .report-table-th.compact th:first-child .hide-compact {
    display: none;
  }

</style>