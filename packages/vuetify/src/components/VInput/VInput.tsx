// Styles
import './VInput.sass'

// Components
import { useInputIcon } from '@/components/VInput/InputIcon'
import { VMessages } from '@/components/VMessages/VMessages'

// Composables
import { makeComponentProps } from '@/composables/component'
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { IconValue } from '@/composables/icons'
import { useRtl } from '@/composables/locale'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { makeValidationProps, useValidation } from '@/composables/validation'

// Utilities
import { computed, toRef, useId } from 'vue'
import { EventProp, genericComponent, pick, propsFactory, useRender } from '@/util'

// Types
import type { ComputedRef, PropType, Ref } from 'vue'
import type { VMessageSlot } from '@/components/VMessages/VMessages'
import type { GenericProps } from '@/util'

export interface VInputSlot {
  id: ComputedRef<string>
  messagesId: ComputedRef<string | undefined>
  isDirty: ComputedRef<boolean>
  isDisabled: ComputedRef<boolean>
  isReadonly: ComputedRef<boolean>
  isPristine: Ref<boolean>
  isValid: ComputedRef<boolean | null>
  isValidating: Ref<boolean>
  hasDetails: Ref<boolean>
  reset: () => void
  resetValidation: () => void
  validate: () => void
}

export const makeVInputProps = propsFactory({
  id: String,
  appendIcon: IconValue,
  baseColor: String,
  centerAffix: {
    type: Boolean,
    default: true,
  },
  color: String,
  glow: Boolean,
  iconColor: [Boolean, String],
  prependIcon: IconValue,
  hideDetails: [Boolean, String] as PropType<boolean | 'auto'>,
  hideSpinButtons: Boolean,
  hint: String,
  persistentHint: Boolean,
  messages: {
    type: [Array, String] as PropType<string | readonly string[]>,
    default: () => ([]),
  },
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
    validator: (v: any) => ['horizontal', 'vertical'].includes(v),
  },

  'onClick:prepend': EventProp<[MouseEvent]>(),
  'onClick:append': EventProp<[MouseEvent]>(),

  ...makeComponentProps(),
  ...makeDensityProps(),
  ...pick(makeDimensionProps(), [
    'maxWidth',
    'minWidth',
    'width',
  ]),
  ...makeThemeProps(),
  ...makeValidationProps(),
}, 'VInput')

export type VInputSlots = {
  default: VInputSlot
  prepend: VInputSlot
  append: VInputSlot
  details: VInputSlot
  message: VMessageSlot
}

export const VInput = genericComponent<new <T>(
  props: {
    modelValue?: T | null
    'onUpdate:modelValue'?: (value: T | null) => void
  },
  slots: VInputSlots,
) => GenericProps<typeof props, typeof slots>>()({
  name: 'VInput',

  props: {
    ...makeVInputProps(),
  },

  emits: {
    'update:modelValue': (value: any) => true,
  },

  setup (props, { attrs, slots, emit }) {
    const { densityClasses } = useDensity(props)
    const { dimensionStyles } = useDimension(props)
    const { themeClasses } = provideTheme(props)
    const { rtlClasses } = useRtl()
    const { InputIcon } = useInputIcon(props)

    const uid = useId()
    const id = computed(() => props.id || `input-${uid}`)

    const {
      errorMessages,
      isDirty,
      isDisabled,
      isReadonly,
      isPristine,
      isValid,
      isValidating,
      reset,
      resetValidation,
      validate,
      validationClasses,
    } = useValidation(props, 'v-input', id)

    const messages = computed(() => {
      if (props.errorMessages?.length || (!isPristine.value && errorMessages.value.length)) {
        return errorMessages.value
      } else if (props.hint && (props.persistentHint || props.focused)) {
        return props.hint
      } else {
        return props.messages
      }
    })

    const hasMessages = toRef(() => messages.value.length > 0)

    const hasDetails = toRef(() => !props.hideDetails || (
      props.hideDetails === 'auto' &&
      (hasMessages.value || !!slots.details)
    ))

    const messagesId = computed(() => hasDetails.value ? `${id.value}-messages` : undefined)

    const slotProps = computed<VInputSlot>(() => ({
      id,
      messagesId,
      isDirty,
      isDisabled,
      isReadonly,
      isPristine,
      isValid,
      isValidating,
      hasDetails,
      reset,
      resetValidation,
      validate,
    }))

    const color = toRef(() => {
      return props.error || props.disabled ? undefined
        : props.focused ? props.color
        : props.baseColor
    })

    const iconColor = toRef(() => {
      if (!props.iconColor) return undefined

      return props.iconColor === true ? color.value : props.iconColor
    })

    useRender(() => {
      const hasPrepend = !!(slots.prepend || props.prependIcon)
      const hasAppend = !!(slots.append || props.appendIcon)

      return (
        <div
          class={[
            'v-input',
            `v-input--${props.direction}`,
            {
              'v-input--center-affix': props.centerAffix,
              'v-input--focused': props.focused,
              'v-input--glow': props.glow,
              'v-input--hide-spin-buttons': props.hideSpinButtons,
            },
            densityClasses.value,
            themeClasses.value,
            rtlClasses.value,
            validationClasses.value,
            props.class,
          ]}
          style={[
            dimensionStyles.value,
            props.style,
          ]}
        >
          { hasPrepend && (
            <div key="prepend" class="v-input__prepend">
              { slots.prepend?.(slotProps.value) }

              { props.prependIcon && (
                <InputIcon
                  key="prepend-icon"
                  name="prepend"
                  color={ iconColor.value }
                />
              )}
            </div>
          )}

          { slots.default && (
            <div class="v-input__control">
              { slots.default?.(slotProps.value) }
            </div>
          )}

          { hasAppend && (
            <div key="append" class="v-input__append">
              { props.appendIcon && (
                <InputIcon
                  key="append-icon"
                  name="append"
                  color={ iconColor.value }
                />
              )}

              { slots.append?.(slotProps.value) }
            </div>
          )}

          { hasDetails.value && (
            <div
              id={ messagesId.value }
              class="v-input__details"
              role="alert"
              aria-live="polite"
            >
              <VMessages
                active={ hasMessages.value }
                messages={ messages.value }
                v-slots={{ message: slots.message }}
              />

              { slots.details?.(slotProps.value) }
            </div>
          )}
        </div>
      )
    })

    return {
      reset,
      resetValidation,
      validate,
      isValid,
      errorMessages,
    }
  },
})

export type VInput = InstanceType<typeof VInput>
