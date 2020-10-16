import React from 'react';

import AppButton   from '@components/AppButton';
import AppCheckbox from '@components/AppCheckbox';
import AppFile     from '@components/AppFile';
import AppIcon     from '@components/AppIcon';
import AppSelect   from '@components/AppSelect';
import AppText     from '@components/AppText';

import { store } from '@/store';

import { parseCsv } from '../../../utils/fileHelper';


/**
 * Render a single group as a JSX.Element
 *
 * @typedef  {Object} GroupViewProps Properties object for the GroupVIew component.
 * @property {string} className css classes to apply in the root element
 *
 * @param {GroupViewProps} props component props
 */
export default class GroupView extends React.Component {

  constructor () {

    super();

    this.state = {
      groupName: '',
      countUnit: 'raw',
      // Sample
      sampleName: '',
      xTickValue: 0,
      // Replicate
      replicates: [],
      accessionColumn: 0,
      countColumn: 0,
      header: false,
      separator: ''
    };

  }

  /**
   * Submit new or updated group to the store. Navigate to DataView page.
   * @param {React.FormEvent<HTMLInputElement>} event
   */
  handleSubmit = async (event) => {

    event.preventDefault();

    const { separator, header, accessionColumn, countColumn } = this.state;

    let replicates = await Promise.all(

      this.state.replicates.map((replicate) => parseCsv(replicate, {
        separator,
        header,
        accessionColumn,
        countColumn,
      }))

    );

    store.checkAndAddReplicates(this.state, replicates);
    this.props.onSave();
  }

  render () {

    return (
      <form
        className={
          `w-full ${this.props.className || ''}`
        }
        onSubmit={ this.handleSubmit }
      >

        {/* GROUP */}
        <div className="flex flex-col md:flex-row" >

          {/* GROUP NAME */}
          <AppText
            className="w-full md:w-1/2"
            label="Group name"
            value={ this.state.groupName }
            onChange={ (event) => this.setState({ groupName: event.target.value }) }
          />

          {/* COUNT UNIT */}
          <AppSelect
            className="w-full md:w-1/2 md:ml-2"
            label="Count unit"
            value={ this.state.countUnit }
            options={[
              { label: 'Raw',  value: 'raw' },
              { label: 'RPKM', value: 'rpkm' },
              { label: 'TPM',  value: 'tmp' }
            ]}
            onChange={ (event) => this.setState({ countUnit: event.target.value }) }
          />

        </div>


        {/* SAMPLE */}
        <div className="flex flex-col md:flex-row mt-4">

          {/* NAME */}
          <AppText
            className="w-full md:w-1/2"
            placeholder="e.g. DAS-1"
            label="Sample name"
            value={ this.state.sampleName }
            onChange={ (event) => this.setState({ sampleName: event.target.value }) }
          />

          {/* X-VALUE */}
          <AppText
            className="w-full md:w-1/2 md:ml-2"
            placeholder="1..N"
            label="Sample X-value"
            value={ this.state.xTickValue }
            onChange={ (event) => this.setState({ xTickValue: event.target.value }) }
          />

        </div>


        {/* REPLICATES */}
        <div className="flex flex-col md:flex-row mt-4" >

          {/* COLUMN separator */}
          <AppSelect
            className="w-full md:w-1/3"
            placeholder="1..N"
            label="separator"
            value={ this.state.separator }
            options={[
              { label: 'Auto', value: ''   },
              { label: 'TAB',  value: '\t' },
              { label: 'CSV',  value: ','  }
            ]} onChange={ (event) => this.setState({ separator: event.target.value }) }
          />

          {/* GENE ID COLUMN */}
          <AppText
            className="w-full md:w-1/3 md:ml-2"
            placeholder="1..N"
            label="Gene ID column"
            value={ this.state.accessionColumn }
            onChange={ (event) => this.setState({ accessionColumn: event.target.value }) }
          />

          {/* COUNT COLUMN */}
          <AppText
            className="w-full md:w-1/3 md:ml-2"
            placeholder="1..N"
            label="Expression count column"
            value={ this.state.countColumn }
            onChange={ (event) => this.setState({ countColumn: event.target.value }) }
          />

        </div>

        <div
          className="flex flex-col justfify-center items-center mt-4 md:flex-row"
        >

          <AppCheckbox
            className="w-full md:w-1/3"
            label="Header"
            onChange={ (event) => this.setState({ header: event.target.checked })}
          />

          <AppFile
            className="flex justify-center items-center ml-3 py-2 px-5
                       w-full md:w-2/3 secondary-blue"
            multiple
            onChange={  (event) => this.setState({ replicates: [ ...event.target.files ] }) }
          >
            <AppIcon file="base" id="hi-document" className="w-6 h-6 mr-3"/>
              Upload Tables
          </AppFile>

        </div>

        {/* STATE CONTROLS */}

        <div className="flex mt-6 mx-1">

          <AppButton
            className="py-2 px-5 primary-blue"
            type="Submit"
            // onClick={ this.props.onSave }
          >
              Save
          </AppButton>

          <AppButton
            className="ml-3 py-2 px-5 tertiary-pink"
            type="Button"
            value="Cancel"
            onClick={ this.props.onCancel }
          >
              Cancel
          </AppButton>

        </div>
      </form>
    );
  }

}