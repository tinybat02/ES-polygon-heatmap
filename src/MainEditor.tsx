import React, { PureComponent } from 'react';
// import { FormField } from '@grafana/ui';
import { PanelEditorProps } from '@grafana/data';

import { PanelOptions } from './types';

export class MainEditor extends PureComponent<PanelEditorProps<PanelOptions>> {
  render() {
    return (
      <div className="section gf-form-group">
        <h5 className="section-heading">Display</h5>
      </div>
    );
  }
}
