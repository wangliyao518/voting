import React, { Component } from 'react';
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  FormText
} from 'reactstrap';

const Settings = (props) => {
  if (Object.keys(props.electionRules).length === 0) {
    return <p>Retrieving settings ...</p>
  }  
  //const adjustmentThreshold = 100 * props.data.election_rules.adjustment_threshold;
  const primaryDividerRule = Object.keys(props.dividerRules).map((k, i) => {
    return (
      <option key={i} value={k}>{props.dividerRules[k]}</option>
    )
  })
  const adjustmentDividerRule = Object.keys(props.dividerRules).map((k, i) => {
    return (
      <option key={i} value={k}>{props.dividerRules[k]}</option>
    )
  })
  const adjustmentMethods = Object.keys(props.adjustmentMethods).map((k, i) => {
    return (
      <option key={i} value={k}>{props.adjustmentMethods[k]}</option>
    )
  })
  return (
    <Row>
      <Col>
        <h1>Settings</h1>
        <Form>
        <FormGroup>
          <Label for="exampleSelect">Primary divider rule</Label>
          <Input type="select" defaultValue={props.electionRules.primary_divider} name="select" id="exampleSelect">
            {primaryDividerRule}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="exampleSelect">Adjustment divider rule</Label>
          <Input type="select" defaultValue={props.electionRules.adjustment_divider} name="select" id="exampleSelect">
            {adjustmentDividerRule}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="exampleSelect">Adjustment method</Label>
          <Input defaultValue={props.electionRules.adjustment_method} type="select" name="select" id="exampleSelect">
            {adjustmentMethods}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="exampleSelect">Adjustment threshold</Label>
          <Input onChange={(e) => props.setAdjustmentThreshold(e)} type="range" min="0" max="1" step="0.01" value={props.electionRules.adjustment_threshold} />
          {Math.round(props.electionRules.adjustment_threshold * 100)}%
        </FormGroup>        
        </Form>
      </Col>
    </Row>
  )
}

export default Settings;