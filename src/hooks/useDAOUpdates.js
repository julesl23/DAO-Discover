import React, { useContext } from 'react'
import { ethers } from 'ethers'
import BlockchainContext from '../../pages/BlockchainContext'
import ERC4824 from '../../contracts/ERC4824.json'

import { process_env } from '../../pages/process_env'

export default function useDAOUpdates() {
  const blockchainContext = useContext(BlockchainContext)
  const { provider } = blockchainContext

  const getDAOUpdates = async (daoAddresses, fromBlock, toBlock) => {
    const erc4824 = new ethers.Contract(
      process_env.ERC4824_ADDRESS,
      ERC4824.abi,
      provider
    )

    const filterFrom = erc4824.filters.DAOUpdate(null, daoAddresses)
    console.log('getDAOData: filterFrom = ', filterFrom)
    console.log(
      'getDAOData: getBlockNumber = ',
      await provider.getBlockNumber()
    )

    let daoEvents
    if (!fromBlock && !toBlock)
      daoEvents = await erc4824.queryFilter(filterFrom)
    else if (fromBlock && !isNaN(fromBlock) && fromBlock < 0)
      daoEvents = await erc4824.queryFilter(filterFrom, fromBlock)
    else if (
      fromBlock &&
      !isNaN(fromBlock) &&
      fromBlock >= 0 &&
      toBlock &&
      !isNaN(toBlock) &&
      toBlock >= 0
    )
      daoEvents = await erc4824.queryFilter(filterFrom, fromBlock, toBlock)

    if (!daoEvents || daoEvents.length === 0) return []

    console.log('getDAOData: daoEvents = ', daoEvents)

    if (daoEvents && daoEvents.length > 0) {
      const trans = await daoEvents[0].getTransaction()
      const transReceipt = await daoEvents[0].getTransactionReceipt()

      console.log('getDAOData: trans = ', trans)
      console.log('getDAOData: transReceipt = ', transReceipt)
    }

    let daoEventsWithBlockNumber = []

    for (let i = 0; i < daoEvents.length; i++) {
      const daoEvent = daoEvents[i]

      const sender = daoEvent.args[0]
      const dao = daoEvent.args[1]
      const name = daoEvent.args[2]
      const description = daoEvent.args[3]
      const governanceURI = daoEvent.args[4]

      daoEventsWithBlockNumber.push({
        sender,
        dao,
        name,
        description,
        governanceURI,
        blockNumber: daoEvent.blockNumber,
      })
    }

    // sort in descending time order
    daoEventsWithBlockNumber.sort((a, b) =>
      a.blockNumber > b.blockNumber ? -1 : 1
    )

    let daoUpdatesJSONLD = []
    daoEventsWithBlockNumber.forEach((daoEventWithBlockNumber) => {
      const daoUpdateJSONLD = {
        '@context': 'http://www.daostar.org/schemas',
        dao: daoEventWithBlockNumber.dao,
        '@type': 'DAO',
        name: daoEventWithBlockNumber.name,
        description: daoEventWithBlockNumber.description,
        governanceURI: daoEventWithBlockNumber.governanceURI,
        sender: daoEventWithBlockNumber.sender,
        blockNumber: daoEventWithBlockNumber.blockNumber,
      }

      daoUpdatesJSONLD.push(daoUpdateJSONLD)
    })

    return daoUpdatesJSONLD
  }

  const getProposalUpdates = async (
    daoAddresses,
    proposalIds,
    fromBlock,
    toBlock
  ) => {
    const erc4824 = new ethers.Contract(
      process_env.ERC4824_ADDRESS,
      ERC4824.abi,
      provider
    )

    const filterFrom = erc4824.filters.ProposalUpdate(
      null,
      daoAddresses,
      proposalIds
    )
    console.log('getDAOData: filterFrom = ', filterFrom)
    console.log(
      'getDAOData: getBlockNumber = ',
      await provider.getBlockNumber()
    )

    let proposalEvents
    if (!fromBlock && !toBlock)
      proposalEvents = await erc4824.queryFilter(filterFrom)
    else if (fromBlock && !isNaN(fromBlock) && fromBlock < 0)
      proposalEvents = await erc4824.queryFilter(filterFrom, fromBlock)
    else if (
      fromBlock &&
      !isNaN(fromBlock) &&
      fromBlock >= 0 &&
      toBlock &&
      !isNaN(toBlock) &&
      toBlock >= 0
    )
      proposalEvents = await erc4824.queryFilter(filterFrom, fromBlock, toBlock)

    if (!proposalEvents || proposalEvents.length === 0) return []

    console.log('getDAOData: proposalEvents = ', proposalEvents)

    if (proposalEvents && proposalEvents.length > 0) {
      const trans = await proposalEvents[0].getTransaction()
      const transReceipt = await proposalEvents[0].getTransactionReceipt()

      console.log('getDAOData: trans = ', trans)
      console.log('getDAOData: transReceipt = ', transReceipt)
    }

    let proposalEventsWithBlockNumber = []

    for (let i = 0; i < proposalEvents.length; i++) {
      const proposalEvent = proposalEvents[i]

      const sender = proposalEvent.args[0]
      const proposalId = proposalEvent.args[2]
      const proposalURI = proposalEvent.args[3]

      proposalEventsWithBlockNumber.push({
        sender,
        id: proposalId,
        proposalURI,
        blockNumber: proposalEvent.blockNumber,
      })
    }

    // sort in descending time order
    proposalEventsWithBlockNumber.sort((a, b) =>
      a.blockNumber > b.blockNumber ? -1 : 1
    )

    let proposalUpdatesJSONLD = []
    proposalEventsWithBlockNumber.forEach((proposalEventWithBlockNumber) => {
      const proposalUpdateJSONLD = {
        '@context': proposalEventWithBlockNumber['@context'],
        '@type': 'proposal',
        '@id': proposalEventWithBlockNumber['@id'],
        proposalURI: proposalEventWithBlockNumber.proposalURI,
        sender: proposalEventWithBlockNumber.sender,
        blockNumber: proposalEventWithBlockNumber.blockNumber,
      }

      proposalUpdatesJSONLD.push(proposalUpdateJSONLD)
    })

    return proposalUpdatesJSONLD
  }

  const getActivityLogUpdates = async (
    daoAddresses,
    activityIds,
    fromBlock,
    toBlock
  ) => {
    const erc4824 = new ethers.Contract(
      process_env.ERC4824_ADDRESS,
      ERC4824.abi,
      provider
    )

    const filterFrom = erc4824.filters.ActivityLogUpdate(
      null,
      daoAddresses,
      activityIds
    )
    console.log('getDAOData: filterFrom = ', filterFrom)
    console.log(
      'getDAOData: getBlockNumber = ',
      await provider.getBlockNumber()
    )

    let activityLogEvents
    if (!fromBlock && !toBlock)
      activityLogEvents = await erc4824.queryFilter(filterFrom)
    else if (fromBlock && !isNaN(fromBlock) && fromBlock < 0)
      activityLogEvents = await erc4824.queryFilter(filterFrom, fromBlock)
    else if (
      fromBlock &&
      !isNaN(fromBlock) &&
      fromBlock >= 0 &&
      toBlock &&
      !isNaN(toBlock) &&
      toBlock >= 0
    )
      activityLogEvents = await erc4824.queryFilter(
        filterFrom,
        fromBlock,
        toBlock
      )

    if (!activityLogEvents || activityLogEvents.length === 0) return []

    console.log('getDAOData: activityLogEvents = ', activityLogEvents)

    if (activityLogEvents && activityLogEvents.length > 0) {
      const trans = await activityLogEvents[0].getTransaction()
      const transReceipt = await activityLogEvents[0].getTransactionReceipt()

      console.log('getDAOData: trans = ', trans)
      console.log('getDAOData: transReceipt = ', transReceipt)
    }

    let activityLogEventsWithBlockNumber = []

    for (let i = 0; i < activityLogEvents.length; i++) {
      const activityLogEvent = activityLogEvents[i]

      const sender = activityLogEvent.args[0]
      const dao = activityLogEvent.args[1]
      const activityLogId = activityLogEvent.args[2]
      const activityLogURI = activityLogEvent.args[3]

      activityLogEventsWithBlockNumber.push({
        sender,
        dao,
        id: activityLogId,
        activityLogURI,
        blockNumber: activityLogEvent.blockNumber,
      })
    }

    // sort in descending time order
    activityLogEventsWithBlockNumber.sort((a, b) =>
      a.blockNumber > b.blockNumber ? -1 : 1
    )

    let activityLogUpdatesJSONLD = []
    activityLogEventsWithBlockNumber.forEach(
      (activityLogEventWithBlockNumber) => {
        const activityLogUpdateJSONLD = {
          '@context': activityLogEventWithBlockNumber['@context'],
          dao: activityLogEventWithBlockNumber.dao,
          '@type': 'activityLog',
          '@id': activityLogEventWithBlockNumber['@id'],
          activityLogURI: activityLogEventWithBlockNumber.activityLogURI,
          sender: activityLogEventWithBlockNumber.sender,
          blockNumber: activityLogEventWithBlockNumber.blockNumber,
        }

        activityLogUpdatesJSONLD.push(activityLogUpdateJSONLD)
      }
    )

    return activityLogUpdatesJSONLD
  }

  const getMemberUpdates = async (
    daoAddresses,
    memberAddresses,
    fromBlock,
    toBlock
  ) => {
    const erc4824 = new ethers.Contract(
      process_env.ERC4824_ADDRESS,
      ERC4824.abi,
      provider
    )

    const filterFrom = erc4824.filters.MemberUpdate(
      null,
      daoAddresses,
      memberAddresses
    )
    console.log('getDAOData: filterFrom = ', filterFrom)
    console.log(
      'getDAOData: getBlockNumber = ',
      await provider.getBlockNumber()
    )

    let memberEvents
    if (!fromBlock && !toBlock)
      memberEvents = await erc4824.queryFilter(filterFrom)
    else if (fromBlock && !isNaN(fromBlock) && fromBlock < 0)
      memberEvents = await erc4824.queryFilter(filterFrom, fromBlock)
    else if (
      fromBlock &&
      !isNaN(fromBlock) &&
      fromBlock >= 0 &&
      toBlock &&
      !isNaN(toBlock) &&
      toBlock >= 0
    )
      memberEvents = await erc4824.queryFilter(filterFrom, fromBlock, toBlock)

    if (!memberEvents || memberEvents.length === 0) return []

    console.log('getDAOData: memberEvents = ', memberEvents)

    if (memberEvents && memberEvents.length > 0) {
      const trans = await memberEvents[0].getTransaction()
      const transReceipt = await memberEvents[0].getTransactionReceipt()

      console.log('getDAOData: trans = ', trans)
      console.log('getDAOData: transReceipt = ', transReceipt)
    }

    let memberEventsWithBlockNumber = []

    for (let i = 0; i < memberEvents.length; i++) {
      const memberEvent = memberEvents[i]

      const sender = memberEvent.args[0]
      const dao = memberEvent.args[1]
      const memberId = memberEvent.args[2]
      const memberURI = memberEvent.args[3]

      memberEventsWithBlockNumber.push({
        sender,
        dao,
        id: memberId,
        memberURI,
        blockNumber: memberEvent.blockNumber,
      })
    }

    // sort in descending time order
    memberEventsWithBlockNumber.sort((a, b) =>
      a.blockNumber > b.blockNumber ? -1 : 1
    )

    let memberUpdatesJSONLD = []
    memberEventsWithBlockNumber.forEach((memberEventWithBlockNumber) => {
      const memberUpdateJSONLD = {
        '@context': memberEventWithBlockNumber['@context'],
        dao: memberEventWithBlockNumber.dao,
        '@type': 'member',
        '@id': memberEventWithBlockNumber['@id'],
        memberURI: memberEventWithBlockNumber.memberURI,
        sender: memberEventWithBlockNumber.sender,
        blockNumber: memberEventWithBlockNumber.blockNumber,
      }

      memberUpdatesJSONLD.push(memberUpdateJSONLD)
    })

    return memberUpdatesJSONLD
  }

  return {
    getDAOUpdates,
    getProposalUpdates,
    getActivityLogUpdates,
    getMemberUpdates,
  }
}
