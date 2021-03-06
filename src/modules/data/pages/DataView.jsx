import React        from 'react';
import { observer } from 'mobx-react';

import AppButton from '@components/AppButton';
import AppIcon   from '@components/AppIcon';
import GroupCard from '../components/GroupCard';

import { dataTable } from '@/store/data-store';


@observer
export default class DataView extends React.Component {

  constructor () {
    super();
    this.state = {
      showGroup: false,
    };
  }

  /* AUXILIARY */

  get dataStats () {
    return Object.entries(dataTable.headerObject).map(([ groupName, sample ]) => {
      return {
        name: groupName,
        sampleCount: Object.keys(sample).length,
        replicateCount: Object.values(sample).reduce((sum,replicates) => sum+=replicates.length,0)
      };
    });
  }

  /* ACTIONS */

  onCardDeleteClick = (groupName) => {
    dataTable.removeColumn(groupName);
  }

  render () {
    return (
      <div className={ `relative w-full ${this.props.className || ''}` }>

        {
          this.dataStats.map((group, index) => (

            <GroupCard
              className="mt-6 first:mt-0"
              key={ `${group.name}-${index}`}
              group={ group }
            >
              {
                <AppButton
                  className="group p-1 rounded-full"
                  onClick={ () => this.onCardDeleteClick(group.name) }
                >
                  <AppIcon
                    file="hero-icons"
                    id="trash"
                    className="w-6 h-6 group-hover:text-pink-700"
                  />
                </AppButton>
              }

            </GroupCard>

          ))
        }

      </div>
    );
  }
}