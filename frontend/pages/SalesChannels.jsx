// Copied as-is from pan-verify src/pages/sales-channel-listing.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SalesChannel, overWriteBreadCrumpsItems, setBreadCrumpsItems } from "nitrozen-react-extension";

import * as SalesChannelService from "../services/salesChannelList.service.js";
import { setCompany } from "../utils/index.js";
import "./sales-channel-listing.css";

const SalesChannelPage = () => {
  const { company_id } = useParams();

  setCompany(company_id);
  const [applications, setApplications] = useState({});
  const [limit, setLimit] = useState(10);
  const [current, setCurrent] = useState(1);
  const [search, setSearch] = useState("");
  const pageSizeOptions = [10];
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchTextChange = useCallback((event) => {
    setSearch(event?.target?.value);
  }, []);

  const handlePaginationChange = useCallback(async (paginationData) => {
    setLimit(paginationData.limit);
    setCurrent(paginationData.current);
  }, []);

  const handleSalesChannelClick = (applicationId) => {
    const salesChannel = applications?.applications?.filter((item) => {
      return item.id === applicationId;
    });
    setBreadCrumpsItems("Home", location.pathname + location.search);
    setBreadCrumpsItems(salesChannel[0].name, location.pathname + location.search);
    navigate(
      `/company/${company_id}/application/${applicationId}?application_name=${salesChannel[0].name}`
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await SalesChannelService.getApplications({
          page: current,
          limit,
          search,
          company_id: `${company_id}`,
        });
        const { data } = response;
        setApplications(() => data);
      } catch (error) {
        console.log(error);
      }
    })();
    overWriteBreadCrumpsItems([]);
  }, [limit, current, search]);

  if (applications && Array.isArray(applications?.applications)) {
    return (
      <div className="sales-channel-wrapper">
        <SalesChannel
          heading="Sales Channel"
          desc="These are the sales channel where this extension is active or inactive"
          searchText={search}
          handleSearchTextChange={handleSearchTextChange}
          applicationList={{ items: applications?.applications, page: applications?.page }}
          handleSalesChannelClick={handleSalesChannelClick}
          limit={limit}
          current={current}
          pageSizeOptions={pageSizeOptions}
          handlePaginationChange={handlePaginationChange}
        />
      </div>
    );
  }

  return <></>;
};

export default SalesChannelPage;
