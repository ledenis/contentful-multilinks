import React from 'react';
import uuidv1 from 'uuid/v1';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';

require('./App.css');

export default class App extends React.Component {
	constructor(props) {
		super(props);

		const {
			extension,
		} = props;

		const existingValue = extension.field.getValue();
		this.state = {
			values: existingValue == null ? [] : existingValue.map((value) => ({id: uuidv1(), value})),
			focus: false,
			dragging: false,
		};
	}

	componentDidMount() {
		const {
			extension,
		} = this.props;

		extension.window.startAutoResizer();
	}

	componentWillUnmount() {
		const {
			extension,
		} = this.props;

		extension.window.stopAutoResizer();
	}

	render() {
		const {
			values,
			focus,
			dragging,
		} = this.state;

		return (
			<React.Fragment>
				<SortableList
					items={values}
					onChange={this.handleChange}
					onDelete={this.handleDeleteItemClick}
					focus={focus}
					onSortStart={this.handleSortStart}
					onSortEnd={this.handleSortEnd}
					lockAxis="y"
					useDragHandle={true}
					helperClass="helper"
					dragging={dragging}
				/>
				<button type="button" className="cf-btn-secondary" onClick={this.handleAddItemClick}>
					Add item
				</button>
			</React.Fragment>
		);
	}

	handleAddItemClick = () => {
		this.setState(({values: prevValues}) => {
			return {
				values: [...prevValues, {id: uuidv1(), value: ''}],
				focus: true,
			};
		}, () => {
			this.reportValues();

		});
	}

	handleDeleteItemClick = (event) => {
		const li = event.currentTarget.closest('li');
		this.setState(({values: prevValues}) => {
			const index = prevValues.findIndex(({id}) => id === li.dataset.id);
			if (index === -1) {
				console.error("Didn't find value in state", event, prevValues);
				return;
			}
			return {
				values: [
					...prevValues.slice(0, index),
					...prevValues.slice(index + 1),
				],
				focus: false,
			};
		}, this.reportValues);
	}

	handleChange = (event, field) => {
		const input = event.currentTarget;
		this.setState(({values: prevValues}) => {
			const index = prevValues.findIndex(({id}) => id === input.closest('li').dataset.id);
			if (index === -1) {
				console.error("Didn't find value in state", event, prevValues);
				return;
			}
			const id = prevValues[index].id;
			const newValue = field === 'title'
				? {id: id, value: {...prevValues[index].value, title: input.value}}
				: {id: id, value: {...prevValues[index].value, url: input.value}}
			return {
				values: [
					...prevValues.slice(0, index),
					newValue,
					...prevValues.slice(index + 1),
				],
				focus: false,
			};
		}, this.reportValues);
	}

	handleSortStart = () => {
		this.setState({
			dragging: true,
			focus: false,
		});
	}

	handleSortEnd = ({oldIndex, newIndex}) => {
		this.setState(({values: prevValues}) => ({
			values: arrayMove(prevValues, oldIndex, newIndex),
			dragging: false,
			focus: false,
		}), this.reportValues);
	}

	async reportValues() {
		const {
			extension,
		} = this.props;
		const {
			values,
		} = this.state;

		console.log('values', values)

		return await extension.field.setValue(values.map(({value}) => value));
	}
}

const Handle = SortableHandle(() => (
	<div className="drag-handle" />
));

const SortableItem = SortableElement(({id, value, onChange, onDelete, autoFocus}) => (
	<li className="item" data-id={id}>
		<Handle />
		<div className="item-fields-column">
			<div className="cf-form-field">
				<label htmlFor={`title${id}`}>Title</label>
				<input className="cf-form-input" id={`title${id}`} value={value.title} onChange={(event) => onChange(event, 'title')} autoFocus={autoFocus} />
			</div>
			<div className="cf-form-field">
				<label htmlFor={`url${id}`}>URL</label>
				<input className="cf-form-input" id={`url${id}`} value={value.url} onChange={(event) => onChange(event, 'url')} autoFocus={autoFocus} />
			</div>
		</div>
		<button type="button" className="cf-btn-secondary delete-button" title="Delete" onClick={onDelete}>
			&times;
		</button>
	</li>
));

const SortableList = SortableContainer(({items, onChange, onDelete, focus, dragging}) => (
	<ol className={`item-list ${dragging ? 'dragging' : ''}`}>
		{items.map(({id, value}, index) => (
			<SortableItem
				key={id}
				id={id}
				index={index}
				value={value}
				onChange={onChange}
				onDelete={onDelete}
				autoFocus={index === items.length - 1 && focus}
			/>
		))}
	</ol>
));
