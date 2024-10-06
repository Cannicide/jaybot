import * as React from "react";

export default class Page extends React.Component {

    componentDidMount() {
        if (this.props.title) document.title = `Jaybot | ${this.props.title}`;
        this.onMount();
    }

    onMount() {}

}