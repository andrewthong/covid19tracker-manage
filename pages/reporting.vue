<template>
  <b-container class="pt-3">

    <h1 class="h2 mb-4">Reporting</h1>

    <b-card class="mb-4">

      <h2 class="h4">1. Province and Date</h2>
    
      <b-form-group label="Province" class="province-select">
        <span v-for="(province, index) in provinces"
              v-bind:key="index"
              class="mr-1">
          <b-button v-on:click="setProvince(index)"
                    v-bind:variant="isSelected(province.code)"
                    v-bind:disabled="reportLoaded">
          {{ province.code }}</b-button></span>
      </b-form-group>

      <b-form-group label="Date" class="w-50 mb-3">
        <b-form-datepicker :min="dateOptions.min"
                           :max="dateOptions.max"
                           v-model="form.date"
                           v-bind:disabled="reportLoaded"></b-form-datepicker>
      </b-form-group>

      <b-button v-on:click="loadReport()"
                v-if="! reportLoaded"
                v-bind:disabled="selectedProvince === null"
                variant="primary">Load Report</b-button>

    </b-card>

    <b-card v-if="reportLoaded">

      <h2 class="h6">
        <span class="h4">2. Reports</span>
        <b-badge v-on:click="resetReport()"
                 v-if="reportLoaded"
                 class="align-top"
                 href="#"
                 variant="warning">Select a different Province or Date</b-badge>
      </h2>

      <h5 class="mt-4">Province</h5>
      <b-table-simple striped bordered class="report-table">
        <b-thead head-variant="dark">
          <b-tr>
            <b-th>&nbsp;</b-th>
            <b-th>Current Status</b-th>
            <b-th v-for="(attr, index) in reportAttrs" v-bind:key="index">{{ attr }}</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr>
            <b-th>{{ provinces[selectedProvince].name }}</b-th>
            <b-th>
              <b-form-select v-model="form.status" :options="statusOptions" size="sm"></b-form-select>
            </b-th>
            <b-th v-for="(attr, key) in reportAttrs" v-bind:key="key">
              <b-input type="number" size="sm" min="0" v-model="report[key]" />
            </b-th>
          </b-tr>
        </b-tbody>
      </b-table-simple>

      <b-spinner label="Spinning" v-if="loading"></b-spinner>

      <h5>Health Regions</h5>
      <b-table-simple striped bordered v-if="regions && !loading" class="report-table">
        <b-thead head-variant="dark">
          <b-tr>
            <b-th>&nbsp;</b-th>
            <b-th v-for="(attr, index) in attrs" v-bind:key="index">{{ attr }}</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="region in regions" v-bind:key="region.hr_uid">
            <b-th>
              {{ region.engname }}<br/>
              <small>{{ region.hr_uid }}</small>
            </b-th>
            <b-th v-for="(attr, key) in attrs" v-bind:key="key">
              <b-input type="number" size="sm" min="0" v-model="hr_reports[region.hr_uid][key]" />
            </b-th>
          </b-tr>
        </b-tbody>
      </b-table-simple>

      <b-button v-on:click="saveReport()"
                variant="primary">Save Report</b-button>

    </b-card>

  </b-container>
</template>

<script>
  export default {
    middleware: 'auth',
    data: function() {
      return {
        attrs: {
          'cases': 'Cases',
          'fatalities': 'Fatalities',
          'tests': 'Tests',
          'hospitalizations': 'Hospitalizations',
          'criticals': 'Criticals',
          'recoveries': 'Recoveries',
        },
        // province-level reports don't use this
        provinceExclude: ['cases', 'fatalities'],
        baseAttrs: null,
        provinces: [],
        regions: [],
        regionHash: {},
        loading: false,
        selectedProvince: null,
        form: {
          province: null,
          date: null,
          status: null,
        },
        report: {},
        reportLoaded: false,
        statusOptions: [
          '',
          'Waiting for report',
          'In progress',
          'Reported',
          'No report expected today'
        ],
        dateOptions: {
          min: new Date('2020-01-01'),
          max: new Date(),
        },
        hr_reports: {},
      }
    },
    created() {
      // this.$auth.refreshTokens()
      //
      this.loadOptions();
      this.form.date = new Date().toISOString().split('T')[0];
      // zeroed standard attributes
      this.baseAttrs = JSON.parse(JSON.stringify(this.attrs));
      Object.keys(this.baseAttrs).forEach(v => this.baseAttrs[v] = null);
      // reset
      this.resetReport();
    },
    methods: {
      loadOptions() {
        this.$axios.$get('provinces', {'params': {'geo_only': 1}})
          .then(response => {
            console.log(response);
            this.provinces = response;
          })
          .catch(errors => {
            console.dir(errors);
          });
      },
      setProvince(index) {
        // assign province
        this.selectedProvince = index;
        this.form.province = this.provinces[index].code;
        // preloading some data... province data status
        this.form.status = this.provinces[index].data_status;
      },
      loadReport() {
        // load data...
        this.$axios.$get(`manage/report/${this.form.province}`, {'params': { 'date': this.form.date }})
          .then(response => {
            // load province data
            Object.keys(this.reportAttrs).forEach(attr => {
              // loop through each [expected] key
              if( response.report[attr] !== undefined ) {
                // fill model accordingly
                this.report[attr] = response.report[attr]
              }
            });
            // setup regions
            this.regions = response.regions;
            this.regions.forEach((r, index) => {
              // create v-model
              this.hr_reports[r.hr_uid] = JSON.parse(JSON.stringify(this.baseAttrs));
              // store index reference
              this.regionHash[r.hr_uid] = index;
            });
            // load region data
            if( Array.isArray(response.hr_reports) ) {
              let keys = Object.keys(this.baseAttrs);
              response.hr_reports.forEach(r => {
                keys.forEach(attr => {
                  if( r[attr] !== undefined && this.hr_reports[r.hr_uid] !== undefined ) {
                    console.log(r[attr]);
                    this.hr_reports[r.hr_uid][attr] = r[attr];
                  }
                });
              });
            }
            // complete
            this.reportLoaded = true;
          })
          .catch(errors => {
            console.dir(errors);
          });
      },
      isSelected(code) {
        return this.form.province === code ? 'primary' : 'outline-secondary';
      },
      resetReport() {
        this.report = JSON.parse(JSON.stringify(this.baseAttrs));
        this.form.status = null;
        this.reportLoaded = false;
        this.regionHash = {};
      },
    },
    computed: {
      reportAttrs() {
        let { cases, fatalities, ...attrs } = this.attrs;
        return attrs;
      },
    },
  }
</script>

<style>

  .report-table th:first-child {
    width: 20%;
    text-align: right;
  }

  .province-select .btn {
    font-weight: bold;
  }

  .province-select .btn-primary {
    text-decoration: underline;
  }

</style>