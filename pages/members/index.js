import React, { useEffect, useState, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/solid'
import useSkynet from '../../src/hooks/useSkynet'
import { format } from 'date-fns'
import { process_env } from '../process_env'
import useDAOUpdates from '../../src/hooks/useDAOUpdates'

export default function Members() {
  const { downloadFile } = useSkynet()

  const { getMemberUpdates } = useDAOUpdates()

  const [fromBlock, setFromBlock] = useState('')

  const [toBlock, setToBlock] = useState('')

  const [memberSearchResults, setMemberSearchResults] = useState('')
  const [memberUpdates, setMemberUpdates] = useState()
  const [memberUpdatesFoundText, setMemberUpdatesFoundText] = useState('')
  const governanceUpdates = useRef([])

  const initialMemberSearch = {
    fromBlock: '',
    toBlock: '',
  }

  // form validation rules
  const validationSchema = Yup.object().shape({
    daoAddresses: Yup.string(),
    memberAddresses: Yup.string(),
    fromBlock: Yup.string(),
    toBlock: Yup.string(),
  })

  const formOptions = {
    defaultValues: initialMemberSearch,
    resolver: yupResolver(validationSchema),
  }

  // functions to build form returned by useForm() and useFieldArray() hooks
  const { register, control, handleSubmit, reset, formState, watch } =
    useForm(formOptions)
  const { errors } = formState

  function parseDateString(value, originalValue) {
    const parsedDate = isDate(originalValue)
      ? originalValue
      : parse(originalValue, 'yyyy-MM-dd', new Date())

    return parsedDate
  }

  async function onSubmit(data) {
    console.log('Members: data = ', data)
    setMemberUpdates('')

    let daoAddresses = null
    if (data.daoAddresses) {
      daoAddresses = data.daoAddresses.split(' ').join('').split(',')
    }
    console.log('Members: daoAddresses = ', daoAddresses)

    let memberAddresses = null
    if (data.memberAddresses) {
      memberAddresses = data.memberAddresses.split(' ').join('').split(',')
    }
    console.log('Members: memberAddresses = ', memberAddresses)

    const theMemberUpdates = await getMemberUpdates(
      daoAddresses && daoAddresses.length > 0 ? daoAddresses : null,
      memberAddresses && memberAddresses.length > 0 ? memberAddresses : null,
      data.fromBlock && !isNaN(data.fromBlock)
        ? parseInt(data.fromBlock)
        : null,
      data.toBlock && !isNaN(data.toBlock) ? parseInt(data.toBlock) : null
    )

    console.log('Members: theMemberUpdates = ', theMemberUpdates)

    // retrieve member text
    let memberUpdatesJSONLD = []
    if (theMemberUpdates && theMemberUpdates.length > 0) {
      for (let idx in theMemberUpdates) {
        const memberUpdate = theMemberUpdates[idx]

        if (memberUpdate.memberURI) {
          const member = await downloadFile(memberUpdate.memberURI)

          console.log(
            'Members: memberUpdate.memberURI = ',
            memberUpdate.memberURI
          )
          console.log('Members: member = ', member)

          memberUpdatesJSONLD.push({
            ...member,
            sender: memberUpdate.sender,
            blockNumber: memberUpdate.blockNumber,
          })
        }
      }
      setMemberUpdates(memberUpdatesJSONLD)

      setMemberUpdatesFoundText('')
    } else setMemberUpdatesFoundText('No ')
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-hidden bg-white py-16 px-4 sm:px-6 lg:px-8 lg:py-24">
          <div className="relative mx-auto max-w-xl">
            <h2 className="text-center text-xl font-bold">
              Search for Member updates
            </h2>

            <div className="border-t border-gray-200 py-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 rounded-lg border-2 border-palette1-light-purple p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    DAO addresses
                  </dt>
                  <dd className="mt-2">
                    <textarea
                      name={`daoAddresses`}
                      rows={3}
                      {...register(`daoAddresses`)}
                      type="text"
                      className="block w-full rounded-md border-2 border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                    />
                  </dd>
                </div>
                <p className="animate-[pulse_1s_ease-in-out_infinite] text-palette1-light-pink">
                  {errors.daoAddresses?.message}
                </p>

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Member addresses
                  </dt>
                  <dd className="mt-2">
                    <textarea
                      name={`memberAddresses`}
                      rows={3}
                      {...register(`memberAddresses`)}
                      type="text"
                      className="block w-full rounded-md border-2 border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                    />
                  </dd>
                </div>
                <p className="animate-[pulse_1s_ease-in-out_infinite] text-palette1-light-pink">
                  {errors.memberAddresses?.message}
                </p>

                <div className="mx-auto grid max-w-2xl grid-cols-2 space-x-4 sm:col-span-2">
                  {/* <span className="font-medium text-gray-900">Default Components:</span> */}
                  <div className="col-span-1">
                    <div>
                      <dt className="relative mt-4 text-sm font-medium text-gray-500">
                        Block from
                      </dt>

                      <input
                        name={`fromBlock`}
                        type="number"
                        {...register(`fromBlock`)}
                        className="mt-2 rounded-md border-2 border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div>
                      <dt className="relative mt-4 text-sm font-medium text-gray-500">
                        Block to
                      </dt>
                      <input
                        type="number"
                        {...register(`toBlock`)}
                        className="mt-2 rounded-md border-2 border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-palette1-light-pink">
                  {errors.fromBlock?.message}
                </p>
                <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-palette1-light-pink">
                  {errors.toBlock?.message}
                </p>
              </dl>
            </div>

            <div className="border-top-0 mt-8 flex flex-1 justify-center">
              <button
                type="submit"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="overflow-hidden bg-white py-4 px-4 sm:px-6 lg:px-8 lg:py-6">
        <h2 className="text-center text-xl font-bold">
          {memberUpdatesFoundText} Member updates found
        </h2>
        <div className="relative mx-auto max-w-2xl divide-y-2 divide-dashed divide-gray-600">
          {memberUpdates &&
            memberUpdates.length > 0 &&
            memberUpdates.map((memberUpdate) => (
              <div>
                <div className="mt-8 flex justify-between">
                  <div>sender: {memberUpdate.sender}</div>
                  <div>block: {memberUpdate.blockNumber}</div>
                </div>
                <div className="mt-4 w-fit border-2 border-gray-400 p-4">
                  <pre>
                    {JSON.stringify(
                      {
                        ...memberUpdate,
                        sender: undefined,
                        blockNumber: undefined,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
