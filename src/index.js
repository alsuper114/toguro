import Mustache from 'mustache'

const whatInputType = {
// 'json-schema': 'input[type=]'
  'string': 'text',
  'boolean': 'checkbox',
  'integer': 'number'
}

const templates = {
  label: `<label class='{{ klass }}-label' for='{{ key }}-field'> {{ title }}</label>`,
  input: `<input id='{{ key }}-field' type='{{ type }}' name='{{ key }}' class='{{ klass }}'/>`,
  submit: `<input type="submit" class='{{ klass }}' value='{{ value }}'/>`,
  checkbox: `<label class='{{ key }}-label' for='{{ key }}-field'>{{> input }} {{ title }}</label>`,
  generic: `{{> label }} {{> input }}`
}

function textToElement (text) {
  return document.createRange().createContextualFragment(text)
}

function getRenderer (type) {
  const renderers = {
    label (key, value) {
      return Mustache.render(templates['label'], { ...value, key })
    },

    text (key, value) {
      return Mustache.render(templates['generic'], {
        ...value,
        key,
        type: whatInputType[value.type]
      }, {
        label: templates['label'],
        input: templates['input']
      })
    },

    checkbox (key, value) {
      return Mustache.render(templates['checkbox'], {
        ...value,
        key,
        type: whatInputType[value.type]
      }, {
        input: templates['input']
      })
    },

    number (key, value) {
      return Mustache.render(templates['generic'], {
        ...value,
        key,
        type: whatInputType[value.type]
      }, {
        label: templates['label'],
        input: templates['input']
      })
    }
  }

  return renderers[type]
}

const createFormElement = (key, value) => {
  const div = document.createElement('div')
  div.className = 'form-group'

  const renderer = getRenderer(whatInputType[value.type])
  const rendered = renderer(key, value)

  div.appendChild(textToElement(rendered))

  return div
}

export const render = (el, { schema: { properties }, submitHandler }) => {
  // init validations
  // eslint-disable-next-line
  if (!(el instanceof Element)) {
    throw new Error('el should be a valid HTML Element')
  }

  const form = document.createElement('form')
  form.setAttribute('class', 'form')

  const fieldSet = document.createElement('fieldset')

  // createElements
  Object.keys(properties).forEach(key => {
    console.log(key, properties[key])
    const inputEl = createFormElement(key, properties[key])
    fieldSet.insertAdjacentElement('beforeend', inputEl)
  })

  // add submit button
  const submitButton = textToElement(Mustache.render(templates['submit'], { klass: 'button -primary', value: 'Submit!' }))

  fieldSet.appendChild(submitButton)
  form.insertAdjacentElement('beforeend', fieldSet)
  //
  el.insertAdjacentElement('beforeend', form)

  // createEventHandlers
  form.onsubmit = (event) => {
    event.preventDefault()
    submitHandler('walang data')
  }
}
