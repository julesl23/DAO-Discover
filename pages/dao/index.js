import React, { useEffect, useState, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/solid'
import useSkynet from '../../src/hooks/useSkynet'
import { format } from 'date-fns'
import { process_env } from '../process_env'
import useDAOUpdates from '../../src/hooks/useDAOUpdates'

export default function DAO() {
  const { downloadFile } = useSkynet()

  const { getDAOUpdates } = useDAOUpdates()

  const [fromBlock, setFromBlock] = useState('')

  const [toBlock, setToBlock] = useState('')

  const [daoSearchResults, setDAOSearchResults] = useState('')
  const [daoUpdates, setDaoUpdates] = useState()
  const [daoUpdatesFoundText, setDAOUpdatesFoundText] = useState('')
  const governanceUpdates = useRef([])

  const initialDAOSearch = {
    fromBlock: '',
    toBlock: '',
  }

  // form validation rules
  const validationSchema = Yup.object().shape({
    daoAddresses: Yup.string(),
    fromBlock: Yup.string(),
    toBlock: Yup.string(),
  })

  const formOptions = {
    defaultValues: initialDAOSearch,
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
    console.log('DAO: data = ', data)

    let daoAddresses = null
    if (data.daoAddresses) {
      daoAddresses = data.daoAddresses.split(' ').join('').split(',')
    }
    console.log('DAO: daoAddresses = ', daoAddresses)

    const theDAOUpdates = await getDAOUpdates(
      daoAddresses,
      data.fromBlock && !isNaN(data.fromBlock)
        ? parseInt(data.fromBlock)
        : null,
      data.toBlock && !isNaN(data.toBlock) ? parseInt(data.toBlock) : null
    )
    setDaoUpdates(theDAOUpdates)

    console.log('DAO: theDAOUpdates = ', theDAOUpdates)

    // retrieve governance text
    if (theDAOUpdates && theDAOUpdates.length > 0) {
      for (let idx in theDAOUpdates) {
        const daoUpdate = theDAOUpdates[idx]
        const governance = await downloadFile(daoUpdate.governanceURI)

        console.log('DAO: daoUpdate.governanceURI = ', daoUpdate.governanceURI)
        console.log('DAO: governance = ', governance)

        governanceUpdates.current.push(governance)
      }
      setDAOUpdatesFoundText('')
    } else setDAOUpdatesFoundText('No ')
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-hidden bg-white py-16 px-4 sm:px-6 lg:px-8 lg:py-24">
          <div className="relative mx-auto max-w-xl">
            <h2 className="text-center text-xl font-bold">
              Search for DAO updates
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
          {daoUpdatesFoundText} DAO updates found
        </h2>
        <div className="relative mx-auto max-w-2xl divide-y-2 divide-dashed divide-gray-600">
          {daoUpdates &&
            daoUpdates.length > 0 &&
            daoUpdates.map((daoUpdate, daoIdx) => (
              <div>
                <div className="mt-8 flex justify-between">
                  <div>sender: {daoUpdate.sender}</div>
                  <div>block: {daoUpdate.blockNumber}</div>
                </div>
                <div className="mt-4 w-fit border-2 border-gray-400 p-4">
                  <pre>
                    {JSON.stringify(
                      {
                        ...daoUpdate,
                        sender: undefined,
                        blockNumber: undefined,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
                <div className="mt-4 w-fit border-2 border-dashed border-gray-400 p-4">
                  <pre>{governanceUpdates.current[daoIdx]}</pre>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
